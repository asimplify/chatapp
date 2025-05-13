import { useState, useRef, useEffect } from "react";
import { Box, Input, VStack, HStack, Text, IconButton, Image, Spinner, Avatar, Button } from "@chakra-ui/react";
import { FaPaperPlane } from "react-icons/fa";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { BASE_URL, toastDuration, USER_TOKEN_CHAT } from "@/utils/constants";
import Sidebar from "../sidebar";
import BotAvatar from "@/assets/images/bot.jpg";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { parse } from "best-effort-json-parser";
import { getUserName } from "@/utils/helper";
interface Verse {
  arabic: string;
  translation: string;
  surah_name: string;
  verse_number: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: any;
  isLoading?: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [newChat, setNewChat] = useState<boolean>(false);
  const [isConversationLoading, setIsConversationLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get(USER_TOKEN_CHAT);
  const router = useRouter();
  const { conversation_id } = router.query;
  const [userName, setUserName] = useState<any>({});

  const fetchInitialConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/get_chat_messages/${conversation_id}`, {
        method: "GET",
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        // },
      });
      const res = await response.json();
      if (!res?.has_error) {
        setMessages(res?.result);
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (error) {
      toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      console.error("Error fetching initial conversation:", error);
    }
    setIsLoading(false);
  };

  const postConversationApiCall = async (user_query: any, assistant_respnose: any) => {
    try {
      const response = await fetch(`${BASE_URL}/add_recent_query`, {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        // },
        body: JSON.stringify({ user_query, assistant_respnose, conversation_id }),
      });
      const res = await response.json();
      if (!res?.has_error) {
        if (!conversation_id && res?.result?.conversation_id) {
          setNewChat(true);
          router.push(`?conversation_id=${res?.result?.conversation_id}`);
        }
      } else {
        console.error("Error");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };


  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsConversationLoading(true);
    let formattedMessage: any = "";
    const placeholderBotMessage: Message = {
      role: "assistant",
      content: "",
      isLoading: true,
    };
    setMessages((prev) => [...prev, placeholderBotMessage]);
    setInput("");

    try {
      const response = await fetch(`${BASE_URL}/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_query: input, chat_history: messages }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        chunk.split("\n").forEach((line) => {
          if (line.trim()) {
            try {
              accumulatedResponse += line;
              let parsedResponse;
              if (accumulatedResponse.length > 0) {
                parsedResponse = parse(accumulatedResponse);
              }
              formattedMessage = parsedResponse;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: formattedMessage?.message || "Information not available.",
                  isLoading: false,
                };
                return updated;
              });
            } catch (error) {
              console.error("Error processing chunk:", error);
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: "Error fetching response. Please try again.",
                  isLoading: false,
                };
                return updated;
              });
            }
          }
        });
      }
      setIsConversationLoading(false);
      // if (!isConversationLoading) {
      //   postConversationApiCall(input, JSON.stringify(formattedMessage));
      // }
    } catch (error) {
      console.error("Streaming error:", error);
      setIsConversationLoading(false);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error fetching response. Please try again.",
          isLoading: false,
        };
        return updated;
      });
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box display="flex" bg="white">
      {/* <Sidebar newChat={newChat} conversation_id={conversation_id} /> */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex="1" height={{ base: "100vh", lg: "auto" }}>
          <Spinner size="xl" color={"#3D2D4C"} />
        </Box>
      ) : (
        <Box w={{ base: "100%" }} p={{ base: 4, lg: 6 }} mx="auto" flex="1">
          <Box position="fixed" display={{ base: "block" }} top={4} right={4} cursor={"pointer"}>
            <Button
              variant="solid"
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
              onClick={() => router.push("/file")}
            >
              File upload
            </Button>
            {/* <Avatar.Root background={"#3D2D4C"} color={"white"}>
              <Avatar.Fallback name={userName?.first_name + " " + userName?.last_name} />
            </Avatar.Root> */}
          </Box>

          <Box
            ref={chatContainerRef}
            style={
              {
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                "-ms-overflow-style": "none",
                scrollbarWidth: "none",
              } as any
            }
            w="full"
            maxW={{ base: "100%", lg: "900px" }}
            mx="auto"
            h={"calc(100vh - 150px)"}
            overflowY="auto"
            p={2}
          >
            <VStack gap={4} align="stretch">
              {messages?.map((msg: Message) => (
                <HStack
                  key={msg.id}
                  alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
                  maxW={{ base: "100%", lg: "80%" }}
                  gap={1}
                  mt={{ base: 14, lg: 8 }}
                >
                  {msg?.role === "assistant" && (
                    <Image
                      src={BotAvatar.src}
                      alt="Chat Bot"
                      boxSize="30px"
                      borderRadius="full"
                      objectFit="cover"
                      alignSelf="flex-start"
                      mt={2}
                    />
                  )}
                  <VStack
                    align={msg?.role === "user" ? "end" : "start"}
                    bg={msg?.role === "user" ? "#3D2D4C" : "transparent"}
                    p={2}
                    borderRadius="md"
                    gap={2}
                    w="full"
                  >
                    {msg?.isLoading && msg?.role === "assistant" ? (
                      <Spinner size="sm" mt={1} color="#3D2D4C" />
                    ) : (
                      <Text
                        color={msg?.role === "user" ? "white" : "#3D2D4C"}
                        fontSize={{ base: "12px", lg: "14px" }}
                        fontFamily="Roboto"
                      >
                        {msg?.content}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          <HStack
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            bg="white"
            w="full"
            maxW={{ base: "100%", lg: "900px" }}
            mt={4}
            mx="auto"
            p={2}
            borderRadius="md"
            boxShadow="md"
            alignItems="center"
          >
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              border="none"
              flex="1"
              _focus={{ border: "none", boxShadow: "none", outline: "none" }}
            />
            <IconButton
              aria-label="Send message"
              onClick={sendMessage}
              color="#3D2D4C"
              bg="transparent"
              _hover={{ bg: "transparent" }}
              borderRadius="full"
              disabled={isConversationLoading || !input}
            >
              <FaPaperPlane />
            </IconButton>
          </HStack>
        </Box>
      )}
    </Box>
  );
}
