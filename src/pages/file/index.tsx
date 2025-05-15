import { Box, Button, Table, VStack, HStack, Flex, Icon, Spinner, Field, Textarea } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import FileUploadDialog from "@/components/fileUploadDialog";
import { useRouter } from "next/router";
import { toaster } from "@/components/ui/toaster";
import { BASE_URL, toastDuration } from "@/utils/constants";
import { FaTrash } from "react-icons/fa";

export default function File() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileOpen = () => {
    setIsOpen(true);
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/files`, {
        method: "GET",
      });
      const res = await response.json();

      if (!res?.has_error) {
        setFiles(res?.result?.files);
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(`${BASE_URL}/file?file_name=${fileName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (!res?.has_error) {
        fetchFiles();
        toaster.create({ title: "File delete successfully", type: "success", duration: toastDuration });
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const res = await response.json();
      if (!res?.has_error) {
        fetchText();
        toaster.create({ title: "File delete successfully", type: "success", duration: toastDuration });
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/text`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (!res?.has_error) {
        fetchText();
        toaster.create({ title: "Text removed successfully", type: "success", duration: toastDuration });
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchText = async () => {
    try {
      const response = await fetch(`${BASE_URL}/text`, {
        method: "GET",
      });
      const res = await response.json();
      if (!res?.has_error) {
        setText(res?.result?.text);
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchText();
  }, []);

  return (
    <Box p={{ base: 4, md: 6, lg: 8 }} maxW="800px" mx="auto">
      <VStack gap={6} align="stretch" pt={10}>
        <Flex justifyContent="flex-end" mb={4}>
          <HStack mb={4}>
            <Button
              variant="outline"
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
              onClick={() => router.push("/")}
            >
              Go to chat
            </Button>
            <Button variant="solid" background={"#3D2D4C"} size={{ base: "sm", md: "md" }} onClick={handleFileOpen}>
              Upload File
            </Button>
          </HStack>
        </Flex>
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spinner size="sm" color="#3D2D4C" />
          </Flex>
        ) : (
          <Table.ScrollArea>
            <Table.Root size={{ base: "sm", md: "md" }} overflowX={"auto"}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>File Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Action</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {files.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={2} textAlign="center">
                      No files found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  files.map((file: any, index: number) => (
                    <Table.Row key={index}>
                      <Table.Cell truncate>
                        {file?.name}
                        {file?.extension}
                      </Table.Cell>
                      <Table.Cell>
                        <Icon
                          fontSize="18px"
                          color={"red"}
                          cursor={"pointer"}
                          pb={"1px"}
                          onClick={() => handleDelete(file?.name)}
                        >
                          <FaTrash />
                        </Icon>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        )}

        <Field.Root pt={4}>
          <Field.Label pl={1}>Add More Information</Field.Label>
          <Textarea
            placeholder="Start typing..."
            variant="outline"
            size={"lg"}
            value={text ?? ""}
            _focus={{ border: "1px solid #E0E0E0", outline: "none" }}
            onChange={(e) => setText(e.target.value)}
          />
        </Field.Root>
        <Box display={"flex"} justifyContent={"center"} gap={1}>
          {text && (
            <Button type="submit" variant="outline" width={"50%"} onClick={() => handleTextDelete()}>
              Delete Information
            </Button>
          )}
          <Button
            type="submit"
            background={"#3D2D4C"}
            loading={isSubmitting}
            disabled={!text}
            width={"50%"}
            onClick={handleTextSubmit}
          >
            Submit
          </Button>
        </Box>
      </VStack>
      <FileUploadDialog isOpen={isOpen} setIsOpen={setIsOpen} fetchFiles={fetchFiles} />
    </Box>
  );
}
