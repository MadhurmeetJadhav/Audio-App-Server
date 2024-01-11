import * as yup from "yup";
import { isValidObjectId } from "mongoose";

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is missing!")
    .min(2, "Name is too short!")
    .max(20, "Name is too long!"),
  email: yup
    .string()
    .required("Email is required!!")
    .email("Invalid email address!!"),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(5, "Password is too short!!")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/,
      "Password is too easy!"
    ),
});

export const TokenAndIdValidation = yup.object().shape({
  token: yup.string().trim().required("Invalid token"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      } else {
        return "";
      }
    })
    .required("Invalid User ID"),
});
export const PasswordValidation = yup.object().shape({
  token: yup.string().trim().required("Invalid token"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      } else {
        return "";
      }
    })
    .required("Invalid User ID"),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(5, "Password is too short!!")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/,
      "Password is too easy!"
    ),
});

export const SignInValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required!!")
    .email("Invalid email address!!"),

  password: yup.string().trim().required("Password is required"),
});
