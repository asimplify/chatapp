import { useState } from "react";
import { Box, Button, Flex, Field, Input, Link, Stack, Text, HStack, Separator } from "@chakra-ui/react";
import GoogleLogo from "@/assets/images/googleLogo.png";
import { BASE_URL, toastDuration } from "@/utils/constants";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    keepLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/@/.test(formData.email)) {
      newErrors.email = "Email must contain @ symbol";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user_signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });

      const res = await response.json();

      if (!res?.has_error) {
        toaster.create({
          title: "Signup Successfully",
          type: "success",
          duration: toastDuration,
        });
        router.push("/login");
      } else {
        toaster.create({
          title: res?.status_code < 500 ? res.errors[0] : "Something went wrong",
          type: "error",
          duration: toastDuration,
        });
      }
    } catch (err: any) {
      toaster.create({
        title: "Something went wrong",
        type: "error",
        duration: toastDuration,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minHeight="100vh" bg="gray.50" justifyContent="center" alignItems="center">
      <Box width={{ base: "100%", md: "70%", xl: "50%" }} p={{ base: 4, lg: 0 }}>
        <Box
          p={8}
          width={{ base: "100%", lg: "60%" }}
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
          mx="auto"
          height={{ base: "auto", xl: "730px" }}
        >
          <Box width="full" maxWidth={{ base: "100%", lg: "405px" }} mx="auto" fontFamily="Roboto" fontWeight="400">
            <Text
              fontSize={"30px"}
              fontFamily="Roboto"
              fontWeight="semibold"
              textAlign={"center"}
              display={{ base: "block", xl: "none" }}
            >
              <span style={{ color: "#3D2D4C" }}>Chat</span> <span style={{ color: "#157B24" }}>App</span>
            </Text>
            <Text mt={3} mb={6} fontSize={{ base: "30px", xl: "40px" }}>
              Sign up
            </Text>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Flex gap={4}>
                  <Field.Root flex={1}>
                    <Field.Label>First Name*</Field.Label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="first name"
                      height={{ base: "37px", xl: "47px" }}
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    {errors.firstName && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.firstName}
                      </Text>
                    )}
                  </Field.Root>

                  <Field.Root flex={1}>
                    <Field.Label>Last Name*</Field.Label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="last name"
                      height={{ base: "37px", xl: "47px" }}
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                    {errors.lastName && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.lastName}
                      </Text>
                    )}
                  </Field.Root>
                </Flex>

                <Field.Root>
                  <Field.Label>Email*</Field.Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    height={{ base: "37px", xl: "47px" }}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.email}
                    </Text>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label>Password*</Field.Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Min. 8 characters"
                    height={{ base: "37px", xl: "47px" }}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  {errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label>Confirm Password*</Field.Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    height={{ base: "37px", xl: "47px" }}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </Field.Root>

                <Button
                  background="#8E12D5"
                  height={{ base: "37px", xl: "47px" }}
                  _hover={{ background: "#8E12D5" }}
                  type="submit"
                  loading={isLoading}
                  mt={6}
                >
                  Sign Up
                </Button>
                <Text textAlign="center" mt={2} mb={8}>
                  Already have an account?&nbsp;
                  <Link
                    color="#397FF7"
                    href="/login"
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                  >
                    Login
                  </Link>
                </Text>
              </Stack>
            </form>
          </Box>
        </Box>
      </Box>

      <Box
        flex={1}
        bg="#3D2D4C"
        color="white"
        display={{ base: "none", xl: "flex" }}
        justifyContent="center"
        alignItems="center"
        height="100vh"
        pl={10}
      >
        <Stack textAlign="center" gap={1}>
          <Text fontSize={{ base: "lg", lg: "64px" }} fontFamily="Roboto" fontWeight="400">
            <span style={{ color: "#FFFFFF" }}>Ask</span> <span style={{ color: "#157B24" }}>Chat</span>
          </Text>
          <Text fontSize="18px" fontFamily="Roboto" fontWeight="400">
            AI-powered Assistant
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}
