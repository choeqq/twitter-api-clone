import { Query, Resolver } from "type-graphql";
import { User } from "./user.dto";

@Resolver(() => User)
class UserResolver {
  @Query(() => User)
  user() {
    return {
      id: "123423",
      email: "fajhfaf2",
      username: "adfijhsafhsa",
    };
  }
}

export default UserResolver;
