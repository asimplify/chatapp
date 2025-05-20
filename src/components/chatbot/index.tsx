import { useState, useRef, useEffect } from "react";
import { Box, Input, VStack, HStack, Text, IconButton, Image, Spinner, Button } from "@chakra-ui/react";
import { FaPaperPlane, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BASE_URL } from "@/utils/constants";
import BotAvatar from "@/assets/images/bot.jpg";
import { useRouter } from "next/router";
import { parse } from "best-effort-json-parser";
import { convertWebmToWav } from "@/utils/helper";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content?: string | Blob;
  isLoading?: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConversationLoading, setIsConversationLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = sendAudio;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    let audio = await convertWebmToWav(audioBlob);
    const formData = new FormData();
    formData.append("voice_file", audio, "recording.wav");
    setIsConversationLoading(true);
    const userMessage: Message = {
      role: "user",
      content: audio,
    };
    setMessages((prev) => [...prev, userMessage]);
    const placeholderBotMessage: Message = {
      role: "assistant",
      content: "",
      isLoading: true,
    };
    setMessages((prev) => [...prev, placeholderBotMessage]);

    try {
      const response = await fetch(`${BASE_URL}/voice`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const assistantAudioUrl = data.audioUrl;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: assistantAudioUrl,
        };
        return updated;
      });
    } catch (error) {
      console.error("Error sending audio:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error processing voice message. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsConversationLoading(false);
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
                };
                return updated;
              });
            }
          }
        });
      }
      setIsConversationLoading(false);
    } catch (error) {
      console.error("Streaming error:", error);
      setIsConversationLoading(false);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error fetching response. Please try again.",
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <Box w={{ base: "100%" }} p={{ base: 4, lg: 6 }} mx="auto" flex="1">
        <Box position="fixed" display={{ base: "block" }} top={4} right={4} cursor={"pointer"}>
          <Button
            variant="solid"
            background={"#3D2D4C"}
            size={{ base: "sm", md: "md" }}
            onClick={() => router.push("/file")}
          >
            File upload
          </Button>
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
          <VStack gap={4} align="stretch" mt={{ base: 14, lg: 8 }}>
            {messages?.map((msg: Message) => (
              <HStack
                key={msg.id}
                alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
                maxW={{ base: "100%", lg: "80%" }}
                gap={1}
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
                  bg={msg?.role === "user" && typeof msg?.content === "string" ? "#3D2D4C" : "transparent"}
                  p={2}
                  borderRadius="md"
                  gap={2}
                  w="full"
                >
                  {msg?.isLoading && msg?.role === "assistant" ? (
                    <Spinner size="sm" mt={1} color="#3D2D4C" />
                  ) : (
                    <>
                      {typeof msg?.content === "string" ? (
                        <Text
                          color={msg?.role === "user" ? "white" : "#3D2D4C"}
                          fontSize={{ base: "12px", lg: "14px" }}
                          fontFamily="Roboto"
                        >
                          {msg?.content}
                        </Text>
                      ) : (
                        msg?.content instanceof Blob && (
                          <audio controls style={{ maxWidth: "100%" }}>
                            <source src={URL.createObjectURL(msg.content)} type="audio/wav" />
                            Your browser does not support the audio element.
                          </audio>
                        )
                      )}
                    </>
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
          <IconButton
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            onClick={toggleRecording}
            color={isRecording ? "red.500" : "#3D2D4C"}
            bg="transparent"
            _hover={{ bg: "transparent" }}
            borderRadius="full"
            disabled={isConversationLoading}
          >
            {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </IconButton>
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
            onClick={() => sendMessage()}
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
    </>
  );
}
