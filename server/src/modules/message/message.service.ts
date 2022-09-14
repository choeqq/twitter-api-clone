import { prisma } from "@prisma/client";
import { CreateMessageInput } from "./message.dto";

export function createMessage({ userId, ...input }: CreateMessageInput) {
  return prisma.message.create({
    data: {
      ...input,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function findMessages(filters?: {}) {
  return prisma.message.findMany();
}
