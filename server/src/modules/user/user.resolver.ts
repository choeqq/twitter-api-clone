import { ApolloError } from "apollo-server-core";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Context } from "../../utils/createServer";
import { LoginInput, RegisterUserInput, User, UserFollowers } from "./user.dto";
import {
  createUser,
  findUserByEmailOrUsername,
  verifyPassword,
} from "./user.service";

@Resolver(() => User)
class UserResolver {
  @Mutation(() => User)
  async register(@Arg("input") input: RegisterUserInput) {
    try {
      const user = await createUser(input);
      return user;
    } catch (e) {
      // check if violates unique constaint
      throw e;
    }
  }

  @Query(() => User)
  me(@Ctx() context: Context) {
    return context.user;
  }

  @Mutation(() => String)
  async login(@Arg("input") input: LoginInput, @Ctx() context: Context) {
    const user = await findUserByEmailOrUsername(
      input.usernameOrEmail.toLowerCase()
    );

    if (!user) {
      throw new ApolloError("Invalid credentials ");
    }

    const isValid = await verifyPassword({
      password: user.password,
      candidatePassword: input.password,
    });

    if (!isValid) {
      throw new ApolloError("Invalid credentials ");
    }

    const token = await context.reply?.jwtSign({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    if (!token) {
      throw new ApolloError("Error signing token");
    }

    context.reply?.setCookie("token", token, {
      domain: "localhost",
      path: "/",
      secure: false,
      httpOnly: true,
      sameSite: false,
    });

    return token;
  }

  @FieldResolver(() => UserFollowers)
  followers() {
    return {
      count: 0,
      items: [],
    };
  }
  @FieldResolver(() => UserFollowers)
  following() {
    return {
      count: 0,
      items: [],
    };
  }
}

export default UserResolver;
