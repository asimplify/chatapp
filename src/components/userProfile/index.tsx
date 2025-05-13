import { Box, Avatar, Text, VStack, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Demo User",
    email: "demo@user.com",
    avatarUrl: "https://bit.ly/dan-abramov",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange =
    (field: keyof UserProfile) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setProfile({
        ...profile,
        [field]: event.target.value,
      });
    };

  const handleSave = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        toaster.create({
          title: "Failed to save profile",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box px={10} pt={20}>
      <Box
        maxW="600px"
        mx="auto"
        bg="white"
        borderRadius="md"
        shadow="md"
        p={6}
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack gap={6} align="stretch">
          <Box textAlign="center" position="relative">
            <Avatar.Root shape="full" size="2xl">
              <Avatar.Fallback name="Dan Abramov" />
              <Avatar.Image src="https://bit.ly/dan-abramov" />
            </Avatar.Root>
          </Box>

          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontWeight="medium" mb={2}>
                Name
              </Text>
              <Input value={profile.name} onChange={handleInputChange("name")} />
            </Box>

            <Box>
              <Text fontWeight="medium" mb={2}>
                Email
              </Text>
              <Input value={profile.email} onChange={handleInputChange("email")} type="email" />
            </Box>

            <Button
              onClick={handleSave}
              bg="blue.400"
              loading={isLoading}
              loadingText="Saving"
              size="md"
              mt={4}
              alignSelf="flex-end"
            >
              Save Profile
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
