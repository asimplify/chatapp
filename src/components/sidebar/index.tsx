import { Box, Button, VStack, Text, Separator, Icon, Link } from "@chakra-ui/react";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { FaBars, FaEllipsisV, FaPlus } from "react-icons/fa";
import { LuLogOut, LuUpload } from "react-icons/lu";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { BASE_URL, USER_TOKEN_CHAT, toastDuration } from "@/utils/constants";
import { FaMessage, FaXmark } from "react-icons/fa6";
import { toaster } from "@/components/ui/toaster";

interface SidebarProps {
  newChat?: boolean;
  conversation_id?: any;
}

const Sidebar = ({ newChat, conversation_id }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = Cookies.get(USER_TOKEN_CHAT);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/user_conversations`, {
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        // },
      });
      const res = await response.json();
      if (!res?.has_error) {
        setChats(res?.result);
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (error) {
      toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const onLogout = async () => {
    Cookies?.remove(USER_TOKEN_CHAT);
    router.push("/login");
  };
  const handleDeleteChat = async (chatId?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/conversation/${chatId}`, {
        method: "DELETE",
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        // },
      });
      const res = await response.json();

      if (!res?.has_error) {
        if (chatId === conversation_id) {
          setIsOpen(false);
          router.push("/");
        }
        fetchChats();
        toaster.create({ title: "Chat deleted successfully", type: "success", duration: toastDuration });
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (error) {
      toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
    }
  };

  useEffect(() => {
    if (newChat === true) {
      fetchChats();
    }
  }, [newChat]);

  return (
    <>
      <Icon
        aria-label="Toggle sidebar"
        position="fixed"
        top={2}
        left={2}
        zIndex={1000}
        display={{ base: "flex", lg: "none" }}
        onClick={() => setIsOpen(!isOpen)}
        bg={isOpen ? "transparent" : "white"}
        color={isOpen ? "white" : "gray.600"}
        boxShadow={isOpen ? "none" : "sm"}
        fontSize="50px"
        borderRadius={2}
      >
        {isOpen ? <Icon as={FaXmark} w={7} h={7} p={1} /> : <Icon as={FaBars} w={7} h={7} p={1} />}
      </Icon>

      <Box
        as="aside"
        position={{ base: "fixed", lg: "relative" }}
        top={0}
        left={0}
        w={{ base: "60%", lg: "15%" }}
        h="100vh"
        bg="#3D2D4C"
        boxShadow={{ base: "lg", lg: "md" }}
        transform={{ base: isOpen ? "translateX(0)" : "translateX(-100%)", lg: "none" }}
        transition="transform 0.3s ease-in-out"
        display={{ base: isOpen ? "block" : "none", lg: "block" }}
        zIndex={999}
      >
        <VStack align="stretch" h="full" gap={6} p={4} color="white">
          <Box textAlign={{ base: "center", lg: "start" }} py={4} ml={{ lg: 1 }}>
            <Text fontSize={{ base: "xl", lg: "20px", xl: "24px" }} fontFamily="Roboto" fontWeight="400">
              <span style={{ color: "#FFFFFF" }}>Chat</span>&nbsp;
              <span style={{ color: "#157B24" }}>App</span>
            </Text>
          </Box>

          <Button
            w="full"
            h="50px"
            bg="transparent"
            border="1px solid #FFFFFF"
            color="white"
            fontFamily="Roboto"
            fontSize="sm"
            justifyContent="flex-start"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            onClick={() => {
              router.push("/");
              setIsOpen(false);
            }}
          >
            <Icon fontSize="40px" pb={"1px"} color={"#FFFFFF"}>
              <FaPlus />
            </Icon>
            New Chat
          </Button>

          <VStack
            align="stretch"
            gap={2}
            maxH="100vh"
            overflowY="auto"
            overflowX="hidden"
            style={
              {
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                "-ms-overflow-style": "none",
                scrollbarWidth: "none",
              } as any
            }
          >
            <Text fontFamily="Roboto" fontSize="sm" fontWeight="semibold">
              All Chats
            </Text>
            {chats.length > 0 ? (
              chats.map((chat: any) => (
                <Box
                  key={chat?.id}
                  display="flex"
                  alignItems="center"
                  w="full"
                  h={"40px"}
                  minH="30px"
                  bg={conversation_id === chat?.id ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  borderRadius={"sm"}
                >
                  <Link
                    flex="1"
                    p={0}
                    pl={2}
                    h="full"
                    w="80%"
                    bg={"transparent"}
                    color="white"
                    fontFamily="Roboto"
                    fontSize="sm"
                    display="flex"
                    alignItems="center"
                    textDecoration="none"
                    _hover={{ textDecoration: "none", bg: "transparent" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                    onClick={() => {
                      router.push(`?conversation_id=${chat?.id}`);
                      setIsOpen(false);
                    }}
                  >
                    <Icon color={"#FFFFFF"}>
                      <FaMessage />
                    </Icon>
                    <Box
                      flex="1"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      maxWidth="calc(100% - 30px)"
                      textAlign={"start"}
                    >
                      {chat?.name}
                    </Box>
                  </Link>
                  <MenuRoot>
                    <MenuTrigger asChild cursor={"pointer"}>
                      <FaEllipsisV />
                    </MenuTrigger>
                    <MenuContent width={"20px"}>
                      <MenuItem
                        value="delete"
                        _hover={{ bg: "transparent" }}
                        onClick={() => {
                          handleDeleteChat(chat?.id);
                          setIsOpen(false);
                        }}
                        cursor={"pointer"}
                      >
                        Delete
                      </MenuItem>
                    </MenuContent>
                  </MenuRoot>
                </Box>
              ))
            ) : (
              <Text fontSize="sm">No chats available</Text>
            )}
          </VStack>

          <Box mt="auto">
            <Separator borderColor="whiteAlpha.300" mb={4} />
            <VStack align="stretch" gap={0}>
              <Text
                as="button"
                fontFamily="Roboto"
                fontSize="sm"
                display="flex"
                alignItems="center"
                gap={2}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                p={2}
                borderRadius="md"
                onClick={() => router.push("/file")}
                cursor={"pointer"}
              >
                <LuUpload />
                Upload File
              </Text>
              {/* <Text
                as="button"
                fontFamily="Roboto"
                fontSize="sm"
                display="flex"
                alignItems="center"
                gap={2}
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                p={2}
                borderRadius="md"
                onClick={onLogout}
                cursor={"pointer"}
              >
                <LuLogOut />
                Logout
              </Text> */}
            </VStack>
          </Box>
        </VStack>
      </Box>

      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.500"
          zIndex={998}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
