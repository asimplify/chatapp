import { BASE_URL, toastDuration, USER_TOKEN_CHAT } from "@/utils/constants";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Spinner,
  Box,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "../ui/toaster";
import Cookies from "js-cookie";

interface FileUploadDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  fetchFiles: () => void;
}
export default function FileUploadDialog({ isOpen, setIsOpen, fetchFiles }: FileUploadDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const token = Cookies.get(USER_TOKEN_CHAT);

  const handleUploadPDF = async (file: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await fetch(BASE_URL + "/upload_file", {
        method: "POST",
        body: formData,
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });
      const res = await response.json();
      if (!res?.has_error) {
        setIsOpen(false);
        fetchFiles();
        toaster.create({ title: "File upload successfully", type: "success", duration: toastDuration });
      } else {
        toaster.create({ title: "Something went wrong", type: "error", duration: toastDuration });
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadPDF(file);
    } else {
      console.error("Please select a PDF file.");
    }
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <DialogBody>
              {isLoading ? (
                <Box display={"flex"} justifyContent={"center"}>
                  <Spinner size="lg" />
                </Box>
              ) : (
                <Input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  placeholder="Outline"
                  variant="outline"
                  pt={2}
                  onChange={(e) => handleFileChange(e)}
                />
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
