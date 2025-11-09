
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChatbotResponse } from "@/app/actions";
import { Avatar, AvatarFallback } from "./ui/avatar";

type Message = {
  id: number;
  role: "user" | "bot";
  content: React.ReactNode;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "bot",
    content: "నమస్కారం! నేను మీకు ఎలా సహాయపడగలను? (Hello! How can I help you?)",
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  
  const addMessage = (role: "user" | "bot", content: React.ReactNode) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, content }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    addMessage('user', userInput);
    setInput("");
    setIsLoading(true);

    const response = await getChatbotResponse(userInput);
    addMessage('bot', response);
    
    setIsLoading(false);
  };
  
  const isInputDisabled = isLoading;

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-8 w-8" />
        <span className="sr-only">Open Chatbot</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Bot /> Mana Ooru Mana Badyatha AI
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[50vh] p-4" ref={scrollAreaRef}>
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'bot' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 text-sm max-w-[80%] break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback><User size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-start gap-3">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                       <Loader2 className="h-4 w-4 animate-spin"/> Thinking...
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input
                placeholder="Ask about Mana Ooru Mana Badyatha..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isInputDisabled}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
