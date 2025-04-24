import { body } from "express-validator";

export const signUpValidation = [
  body("userName")
    .notEmpty()
    .withMessage("Username is required!")
    .bail()
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Username is must be atleast 6 character")
    .bail()
    .isLength({ max: 16 })
    .withMessage("Username is must be less than 16 character"),

  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .bail()
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .bail()
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .bail()
    .isLength({ max: 16 })
    .withMessage("Password must be less than 16 character"),

  body("loginType").notEmpty().withMessage("Logintype is required!"),
];
