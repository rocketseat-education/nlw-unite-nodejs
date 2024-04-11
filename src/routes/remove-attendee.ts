import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"

import { z } from "zod"
import { prisma } from '../lib/prisma'

export async function removeSelectedAttendees(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .delete('/attendees', {
        schema: {
            summary: 'Remove selected attendees',
            tags: ['attendees'],
            body: z.object({
                attendeeIds: z.array(z.number())
            }),
            response: {
                204: z.null(),
            }
        }
        }, async (request, reply) => {
        
        const { attendeeIds } = request.body

        try{
            await prisma.$transaction([
                prisma.checkIn.deleteMany({
                    where: {
                        attendeeId: {
                            in: attendeeIds
                        }
                    }
                }),
                prisma.attendee.deleteMany({
                    where: {
                      id: {
                          in: attendeeIds
                      }                    
                    }
                })
            ])
          
        } catch (error) {
            reply.log.error(error)
            
            return reply.status(400) .send()
        }
    
    
        return reply.status(204).send()
        })
}