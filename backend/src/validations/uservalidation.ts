import { body } from "express-validator";

class UserValidations {
  public static signInValidation = [

    body("data.emailId")
      .isEmail()
      .withMessage("Please enter a valid email address."),
  ];
}
export default UserValidations;
