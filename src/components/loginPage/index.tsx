import { useState } from "react";
import { Box, Button, Flex, Field, Input, Link, Stack, Text, HStack, Separator } from "@chakra-ui/react";
import GoogleLogo from "@/assets/images/googleLogo.png";
import { BASE_URL, toastDuration, USER_TOKEN_CHAT } from "@/utils/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { toaster } from "@/components/ui/toaster";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

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

  const handleCheckboxChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      keepLoggedIn: e.target.checked,
    }));
  };

  const validateForm = () => {
    let newErrors = { email: "", password: "", general: "" };
    let isValid = true;

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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: "", password: "" });

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user_login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const res = await response.json();
      if (!res?.has_error) {
        Cookies.set(USER_TOKEN_CHAT, res?.result, { expires: 28 });
        toaster.create({
          title: "Login Successfully",
          type: "success",
          duration: toastDuration,
        });
        router.push("/");
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
          width={{ base: "100%", lg: "55%" }}
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
          mx="auto"
          height={{ base: "auto", xl: "540px" }}
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
            <Text my={3} fontSize={{ base: "30px", xl: "40px" }}>
              Sign in
            </Text>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
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
                <Flex justifyContent="right" alignItems="flex-end">
                  {/* <Checkbox checked={formData.keepLoggedIn} onChange={handleCheckboxChange}>
                    Keep me logged in
                  </Checkbox> */}
                  <Link
                    color="#397FF7"
                    href="#"
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                  >
                    Forgot password?
                  </Link>
                </Flex>

                <Button
                  background="#8E12D5"
                  height={{ base: "37px", xl: "47px" }}
                  _hover={{ background: "#8E12D5" }}
                  type="submit"
                  loading={isLoading}
                >
                  Login
                </Button>
                <Text textAlign="center" mt={4}>
                  Not registered yet?&nbsp;
                  <Link
                    color="#397FF7"
                    href="/signup"
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                  >
                    Create an Account
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
            <span style={{ color: "#FFFFFF" }}>Chat</span> <span style={{ color: "#157B24" }}>App</span>
          </Text>
          <Text fontSize="18px" fontFamily="Roboto" fontWeight="400">
            AI-powered Assistant
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Login;
