import { Box, Button, Table, VStack, HStack, Flex, Icon, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import FileUploadDialog from "@/components/fileUploadDialog";
import { LuTrash } from "react-icons/lu";
import { useRouter } from "next/router";
import { toaster } from "@/components/ui/toaster";
import { BASE_URL, toastDuration, USER_TOKEN_CHAT } from "@/utils/constants";
import Cookies from "js-cookie";

export default function File() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const token = Cookies.get(USER_TOKEN_CHAT);

  const handleFileOpen = () => {
    setIsOpen(true);
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/files`, {
        method: "GET",
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        // },
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
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
        // },
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

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <Box p={{ base: 4, md: 6, lg: 8 }} maxW="800px" mx="auto">
      <VStack gap={6} align="stretch" pt={10}>
        <Box overflow="hidden">
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
              <Button variant="solid" size={{ base: "sm", md: "md" }} onClick={handleFileOpen}>
                Upload File
              </Button>
            </HStack>
          </Flex>
          {isLoading ? (
            <Flex justify="center" align="center" pt={"200px"}>
              <Spinner size="sm" color="#3D2D4C" />
            </Flex>
          ) : (
            <Table.Root size={{ base: "sm", md: "md" }} overflowX={"auto"}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>File Name</Table.ColumnHeader>
                  {/* <Table.ColumnHeader>Action</Table.ColumnHeader> */}
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
                        {file?.name}.{file?.extension}
                      </Table.Cell>
                      {/* <Table.Cell>
                        <Icon fontSize="40px" pb={"1px"} onClick={() => handleDelete(file?.id)}>
                          <LuTrash />
                        </Icon>
                      </Table.Cell> */}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          )}
        </Box>
      </VStack>
      <FileUploadDialog isOpen={isOpen} setIsOpen={setIsOpen} fetchFiles={fetchFiles} />
    </Box>
  );
}
