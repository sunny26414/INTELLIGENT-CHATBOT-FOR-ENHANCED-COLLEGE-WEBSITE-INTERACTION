import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Card, InputGroup, FormControl } from "react-bootstrap";
import { FaTimes, FaRobot, FaPaperPlane, FaArrowDown } from "react-icons/fa";
import dataSet from "./book";
import Markdown from "markdown-to-jsx";
import { Tooltip } from "@mui/material";
import Badge from "@mui/material/Badge";
import avatar from "../businessman.png";
import gnitcLogo from "../gnitcLogo.webp";
import student from "../student.jpg";
import logo from './logo.jpg'
import SuggestionsButton from "./SuggestionsButton";
import Loader from "./Loader";

const commonMessages = [
  "Facilities",
  "Placement Details",
  "Fee Structure for college and hostel",
  "About College placements",
]

const Chatbot = () => {
  const [show, setShow] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatIconRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const [SuggestedShowQuestions, setSuggestedShowQuestions] = useState(commonMessages);

  const handleShow = () => {
    setShow(!show);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim()) {
      handleUpdateClick(input);
    }
  };

  const handleUpdateClick = async (update) => {
    if (!update.trim()) return;

    const userMessage = { type: "user", text: update, time: new Date() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = process.env.REACT_APP_API_KEY;

      if (!apiKey) {
        throw new Error("API Key not found. Please check your .env file.");
      }

      const systemInstructions = `You are a helpful chatbot assistant for a college.

Context about the college:
${dataSet}

User Question: ${update}

Instructions:
1. If the user's question is related to the college context provided, answer based on that information.
2. If the question cannot be answered from the context, respond: "Sorry, the information you needed is not found, or this is an unrelated conversation."
3. For casual greetings or conversational messages, respond politely.
4. Keep responses concise and helpful.`;

      const options = {
        method: "POST",
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemInstructions }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        options
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Invalid API response structure");
      }

      const totalResponse = data.candidates[0].content.parts[0].text;
      const botMessage = {
        type: "bot",
        text: totalResponse,
        time: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Fetch suggested questions
      if (!totalResponse.toLowerCase().includes("not found")) {
        await fetchSuggestedQuestions(totalResponse);
      } else {
        setSuggestedShowQuestions(commonMessages);
      }
    } catch (error) {
      console.error("Error communicating with the API:", error);
      const errorMessage = {
        type: "bot",
        text: `Error: ${error.message}. Please check your API key in the .env file.`,
        time: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setSuggestedShowQuestions(commonMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedQuestions = async (modalResponse) => {
    try {
      const apiKey = process.env.REACT_APP_API_KEY;

      const systemInstructionsForSuggestedQuestion = `Based on this response: "${modalResponse}"
      
And this context: ${dataSet}

Generate exactly 4 suggested follow-up questions related to the college. Each question should be 5-6 words.
Format: question1, question2, question3, question4`;

      const options = {
        method: "POST",
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemInstructionsForSuggestedQuestion }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        options
      );

      if (response.ok) {
        const data = await response.json();
        const suggestedText = data.candidates[0].content.parts[0].text;
        const questions = suggestedText.split(",").map(q => q.trim()).filter(q => q);
        setSuggestedShowQuestions(questions.length > 0 ? questions : commonMessages);
      } else {
        setSuggestedShowQuestions(commonMessages);
      }
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
      setSuggestedShowQuestions(commonMessages);
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    const chatMessages = chatMessagesRef.current;
    if (chatMessages) {
      const { scrollTop, clientHeight, scrollHeight } = chatMessages;
      setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 10);
    }
  };

  useEffect(() => {
    scrollToBottom();
    inputRef?.current?.focus();
  }, [messages, show]);

  return (
    <>
      <Tooltip
        title="Hey,I am Guru.How can I help you?"
        placement="left"
        open={!show}
        arrow
        PopperProps={{
          sx: {
            "& .MuiTooltip-tooltip": {
              backgroundColor: "#111d5e ",
              padding: "12px",
              fontSize: "14px",
              color: "white",
            },
            "& .MuiTooltip-arrow": {
              color: "#111d5e",
            },
          },
        }}
      >
        <div ref={chatIconRef} className="chat-button">
          {!show && (
            <Badge
              badgeContent={1}
              color="primary"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#111d5e",
                  color: "white",
                },
              }}
            >
              <div className="avatar-background">
                <img
                  height={45}
                  width={45}
                  src={avatar}
                  alt="avatar"
                  onClick={handleShow}
                />
              </div>
            </Badge>
          )}
        </div>
      </Tooltip>

      <Modal
        show={show}
        onHide={handleShow}
        dialogClassName={`${darkMode ? "dark-mode" : ""} modal-lg`}
        centered
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Header className={`chat-header ${darkMode ? "dark" : "light"}`} style={{ backgroundColor: '#FAF9F6' }}>
          <div className="chat-controls">
            <FaTimes
              className="text-black mx-2 cursor-pointer"
              onClick={handleShow}
            />
          </div>
        </Modal.Header>

        <Modal.Body
          className={`chat-body bg-white ${darkMode ? "bg-dark text-white" : "bg-light text-dark"
            }`}
        >
          <div className="chat-body-header">
            <img src={logo} alt="" height={200} />
            <h1>Hey,How can i help you?</h1>
          </div>
          <div
            className="chat-messages"
            ref={chatMessagesRef}
            onScroll={handleScroll}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-container ${msg.type === "user" ? "align-right" : "align-left"
                  }`}
              >
                <span className="message-time">
                  {msg.time?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Markdown
                  className={
                    msg.type === "user" ? "user-message" : "bot-message"
                  }
                >
                  {msg.text}
                </Markdown>
              </div>
            ))}
            {isLoading && (
              <div className="loading-container">
                <Loader />
              </div>
            )}
            <div ref={chatEndRef} />
            {!isLoading && (
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {SuggestedShowQuestions.map((update, index) => (
                  <SuggestionsButton
                    text={update}
                    key={index}
                    onClick={() => handleUpdateClick(update)}
                  />
                ))}
              </div>
            )}
          </div>

          {!isAtBottom && (
            <div className="text-center">
              <FaArrowDown
                size={30}
                className="scroll-down-icon"
                onClick={scrollToBottom}
                title="Scroll to Bottom"
              />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer
          className={`chat-footer bg-white ${darkMode ? "bg-dark" : "bg-light"
            }`}
          style={{ backgroundColor: '#FAF9F6' }}
        >
          <InputGroup>
            <FormControl
              ref={inputRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{
                outline: "none",
              }}
              className="input-field"
            />
            <Button
              className="send-button"
              onClick={() => handleUpdateClick(input)}
              style={{
                backgroundColor: "blue",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              disabled={isLoading || input.trim().length === 0}
            >
              <FaPaperPlane />
            </Button>
          </InputGroup>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Chatbot;