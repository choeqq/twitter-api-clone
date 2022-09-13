import argon2 from "argon2";
import prisma from "../../utils/prisma";
import { RegisterUserInput } from "./user.dto";

export async function createUser(input: RegisterUserInput) {
  // hash the password
  const password = await argon2.hash(input.password);
  //insert the user
  return prisma.user.create({
    data: {
      ...input,
      email: input.email.toLowerCase(),
      username: input.username.toLowerCase(),
      password,
    },
  });
}
