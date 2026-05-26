import React, { useState, useRef, useEffect } from 'react';
import classes from './ChatBot.module.css';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaMicrophone, FaPhone, FaPhoneSlash, FaVolumeUp } from 'react-icons/fa';
import { db } from '../../Utility/Firebase';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCallMode, setIsCallMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const isCallModeRef = useRef(false);
    const isListeningRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const isProcessingRef = useRef(false);
    const silenceCountRef = useRef(0);
    const utteranceRef = useRef(null); // Preserve utterance from garbage collection
    const lastSpokenRef = useRef(''); // Track what bot is currently saying for echo cancellation

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSpeechDetected, setIsSpeechDetected] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [siteKnowledge, setSiteKnowledge] = useState({
        assistantName: "Virtual Assistant",
        developerBio: "",
        siteFeatures: "",
        shippingInfo: "",
        returnPolicy: "",
        systemPrompt: ""
    });
    const messagesEndRef = useRef(null);

    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                let finalTranscript = '';
                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                if (interim) {
                    setInterimTranscript(interim);
                    setIsSpeechDetected(true);
                }

                if (finalTranscript) {
                    // NOISE FILTER: Ignore very short sounds/noises (prevent ghost responses)
                    if (finalTranscript.trim().length < 3) {
                        setIsSpeechDetected(false);
                        setInterimTranscript('');
                        return;
                    }

                    // BARGE-IN: If user interrupts while AI is speaking, stop the AI immediately
                    if (isSpeakingRef.current || isProcessingRef.current) {
                        const cleanFinal = finalTranscript.trim().toLowerCase();
                        // VALIDATION: Only cancel if transcript is significant (>5 chars) and NOT an echo
                        if (cleanFinal.length > 5) {
                            const isEcho = lastSpokenRef.current?.toLowerCase().includes(cleanFinal);
                            if (isEcho) {
                                setIsSpeechDetected(false);
                                setInterimTranscript('');
                                return;
                            }
                            
                            window.speechSynthesis.cancel();
                            isSpeakingRef.current = false;
                            setIsSpeaking(false);
                            isProcessingRef.current = false;
                            setIsTyping(false);
                        } else {
                            // Too short to be a valid interruption, probably noise
                            setIsSpeechDetected(false);
                            setInterimTranscript('');
                            return;
                        }
                    }

                    setIsListening(false);
                    isListeningRef.current = false;
                    setInterimTranscript('');
                    setIsSpeechDetected(false);
                    handleVoiceInput(finalTranscript);
                    
                    // On mobile, we often need to manual-stop continuous to process
                    try { recognition.current.stop(); } catch {}
                }
            };

            recognition.current.onspeechstart = () => {
                setIsSpeechDetected(true);
            };

            recognition.current.onspeechend = () => {
                setIsSpeechDetected(false);
            };

            recognition.current.onerror = (event) => {
                if (event.error === 'no-speech') {
                    silenceCountRef.current += 1;
                    setIsListening(false);
                    isListeningRef.current = false;
                    setIsSpeechDetected(false);
                    return;
                }
                
                if (event.error === 'not-allowed') {
                    setErrorMessage("Microphone access denied. Please check permissions!");
                    setTimeout(() => setErrorMessage(''), 4000);
                }

                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
                isListeningRef.current = false;
                setIsSpeechDetected(false);
                isProcessingRef.current = false; // Fix: Ensure state reset on error
            };

            recognition.current.onend = () => {
                setIsListening(false);
                isListeningRef.current = false;

                // NATURAL FLOW: Add a longer pause after turn ends for a human feel
                setTimeout(() => {
                    if (isCallModeRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
                        if (silenceCountRef.current >= 3) {
                            silenceCountRef.current = 0;
                            speakText("I'm still here! Do you have a question?");
                        } else {
                            startListening();
                        }
                    }
                }, 1500); // 1.5s delay before listening again
            };
        }
        
        // Warm up voices for mobile
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                window.speechSynthesis.getVoices();
            };
            window.speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }
        
        return () => {
            if (recognition.current) {
                recognition.current.onend = null; // Prevent loop on unmount
                try { recognition.current.abort(); } catch {}
            }
            window.speechSynthesis.cancel();
        }
    }, []);

    // Fetch programmable knowledge base from Firebase
    useEffect(() => {
        const unsubscribe = db.collection('assistant_config').doc('main')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    setSiteKnowledge(data);
                    // Set initial greeting only if this is the first load
                    setMessages(prev => prev.length === 0 ? [{ 
                        role: 'assistant', 
                        content: (data.systemPrompt?.split('\n')[0] || "System Active")
                    }] : prev);
                }
            }, (error) => {
                console.error("ChatBot: Firebase snapshot ERROR:", error);
            });
        
        // One-time session greeting logic
        const hasBeenGreeted = sessionStorage.getItem('chatbot_greeted');
        if (!hasBeenGreeted) {
            const timer = setTimeout(() => {
                setShowGreeting(true);
            }, 3500); // 3-second delay for a natural feel
            return () => {
                unsubscribe();
                clearTimeout(timer);
            };
        }
        
        return () => unsubscribe();
    }, []);

    const handleCloseGreeting = (e) => {
        if (e) e.stopPropagation();
        setShowGreeting(false);
        sessionStorage.setItem('chatbot_greeted', 'true');
    };

    const handleOpenChatFromGreeting = () => {
        setIsOpen(true);
        handleCloseGreeting();
    };

    // Automated Watchdog: Restarts the listener if the system gets stuck idle
    useEffect(() => {
        let interval;
        if (isCallMode) {
            interval = setInterval(() => {
                // If call mode is active but NOTHING is happening, restart listener
                if (!isSpeakingRef.current && !isTyping && !isListeningRef.current && !isProcessingRef.current) {
                    startListening();
                }
            }, 3000); // Check every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isCallMode, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || !siteKnowledge) return;

        const userMsg = input;
        processQuery(userMsg);
        setInput('');
    };

    function handleVoiceInput(transcript) {
        silenceCountRef.current = 0; // Reset silence counter on success
        processQuery(transcript);
    }

    function processQuery(query) {
        if (!query.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setIsTyping(true);
        isProcessingRef.current = true; // Block loop restart

        setTimeout(() => {
            const botResponse = generateResponse(query);
            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
            setIsTyping(false);
            
            if (isCallModeRef.current) {
                speakText(botResponse);
            } else {
                isProcessingRef.current = false;
            }
        }, 800); // Reduced delay for better mobile responsiveness
        
        // Safety: Ensure processing is cleared even if speakText fails to trigger onstart
        setTimeout(() => {
            if (isProcessingRef.current && !isCallModeRef.current) {
                isProcessingRef.current = false;
            }
        }, 3000);
    }

    function speakText(text) {
        if (!text) {
            isProcessingRef.current = false;
            return;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            lastSpokenRef.current = text; // Store for echo cancellation
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            // Voice Selection: Try to find a natural-sounding English voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => 
                v.lang.startsWith('en') && 
                (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
            ) || voices.find(v => v.lang.startsWith('en'));
            
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Watchdog: Clear state if audio never starts (mobile bug protection)
            const watchdog = setTimeout(() => {
                if (isSpeakingRef.current && !window.speechSynthesis.speaking) {
                    console.warn("TTS Watchdog trip.");
                    setIsSpeaking(false);
                    isSpeakingRef.current = false;
                    if (isCallModeRef.current) startListening();
                }
            }, 3000);

            utterance.onstart = () => {
                clearTimeout(watchdog);
                isSpeakingRef.current = true;
                setIsSpeaking(true);
                isProcessingRef.current = false; // Allow loop restart/barge-in once audio starts
                if (isCallModeRef.current) setTimeout(() => startListening(), 100);
            };

            utterance.onend = () => {
                clearTimeout(watchdog);
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                isProcessingRef.current = false; // Double guard
                utteranceRef.current = null;
                // AI done speaking - pause before starting mic for natural turn-taking
                if (isCallModeRef.current) {
                    setTimeout(() => startListening(), 1000); 
                }
            };

            utterance.onerror = (e) => {
                clearTimeout(watchdog);
                // Production: Only log real errors, ignore 'canceled' or 'interrupted' as they are part of natural flow
                if (e.error !== 'canceled' && e.error !== 'interrupted') {
                    console.error("TTS Error:", e.error || e);
                }
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                isProcessingRef.current = false; // Unblock on error
                if (isCallModeRef.current) startListening();
            };

            window.speechSynthesis.speak(utterance);
        }
    }

    function startListening() {
        // Guard: Don't start listening if thinking or already listening
        // Note: We ALLOW listening while speaking for Barge-in!
        if (!isCallModeRef.current || isListeningRef.current || isProcessingRef.current) {
            return;
        }

        if (recognition.current) {
            try {
                recognition.current.start();
                
                // Haptic Feedback for Mobile
                if (navigator.vibrate) try { navigator.vibrate(50); } catch {}
                
                setIsListening(true);
                isListeningRef.current = true;
                setInterimTranscript('');

            } catch (err) {
                // Ignore start errors if already running
                if (err.name !== 'InvalidStateError') {
                    console.warn("Speech Recognition Start Error:", err.message);
                    isListeningRef.current = false;
                    setIsListening(false);
                }
            }
        }
    }

    const toggleCallMode = () => {
        if (!isCallMode) {

            setIsCallMode(true);
            isCallModeRef.current = true;
            isSpeakingRef.current = false;
            isProcessingRef.current = false;
            setIsListening(false);
            isListeningRef.current = false;
            
            // PRODUCTION FIX: Cancel any queued speech first, then speak greeting directly.
            // Do NOT start mic here — speakText's onstart opens mic for barge-in,
            // and onend opens mic for the user's turn. Starting mic + TTS at the
            // same time causes TTS to fail on Vercel/production browsers.
            window.speechSynthesis.cancel();
            
            // First time greeting - prioritized by system prompt intro, then fallback
            const promptIntro = siteKnowledge?.systemPrompt?.split(/(?:Q:|Question:|Q\.|Q\s*:)/i)[0]?.trim();
            const defaultIntro = "I am your professional virtual assistant. I am here to help you navigate our Amazon clone store and ensure you have a seamless shopping experience. How can I assist you today?";
            const intro = promptIntro || defaultIntro;
            
            // Small delay to let the browser register the user gesture for TTS
            setTimeout(() => speakText(intro), 150);
        } else {

            setIsCallMode(false);
            isCallModeRef.current = false;
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            isProcessingRef.current = false;
            setIsListening(false);
            isListeningRef.current = false;
            window.speechSynthesis.cancel();
            if (recognition.current) {
                try { recognition.current.abort(); } catch {}
            }
        }
    };

    const generateResponse = (query) => {
        if (!siteKnowledge) return "Syncing...";
        
        const q = query.toLowerCase();
        const prompt = siteKnowledge.systemPrompt || "";
        
        // Smarter Persona Extraction: Grab everything BEFORE the first "Q:" marker
        const personaSection = (prompt.split(/(?:Q:|Question:|Q\.|Q\s*:)/i)[0] || "").trim();
        const persona = personaSection || "I am your virtual assistant. I can help you with shipping, returns, and orders.";

        // Advanced FAQ Search: Robust Block-based matching
        const findAnswerInPrompt = (userInput) => {
            if (!prompt) return null;
            const cleanInput = userInput.toLowerCase().replace(/[?.,!]/g, '');
            
            // Map common speech errors and synonyms
            const mapSynonyms = (w) => {
                const synonyms = {
                    'finder': 'founder', 'find': 'founder', 'fond': 'founder',
                    'buddy': 'wabi', 'wabis': 'wabi',
                    'voice': 'speech', 'speach': 'speech',
                    'chat': 'assistant', 'bot': 'assistant',
                    'checkout': 'buy', 'pay': 'buy', 'purchase': 'buy',
                    'stripe': 'security', 'safe': 'security', 'secure': 'security',
                    'ship': 'shipping', 'deliver': 'shipping', 'delivery': 'shipping',
                    'ethopia': 'ethiopia', 'addis': 'ethiopia',
                    'built': 'created', 'maker': 'created', 'engineer': 'created', 'architect': 'created'
                };
                return synonyms[w] || w;
            };
            const inputWords = cleanInput.split(/\s+/).map(mapSynonyms).filter(w => w.length > 2);
            if (inputWords.length === 0) return null;

            // Split into blocks that start with Q/Question
            const blocks = prompt.split(/(?:Q:|Question:|Q\.|Q\s*:)/i).slice(1);
            let bestMatch = { score: 0, answer: null };

            blocks.forEach(block => {
                const parts = block.split(/(?:A:|Answer:|A\.|A\s*:)/i);
                if (parts.length < 2) return;

                const questionText = parts[0].toLowerCase();
                const answerText = parts[1].trim().split(/(?:Q:|Question:|Q\.)\s*:/i)[0].trim();

                let currentScore = 0;
                inputWords.forEach(word => {
                    if (questionText.includes(word)) {
                        currentScore += 1;
                    } else if (word.length > 4 && questionText.includes(word.substring(0, 4))) {
                        currentScore += 0.5;
                    }
                });

                // Bonus for exact phrase matching
                if (questionText.includes(cleanInput)) currentScore += 2;

                if (currentScore > bestMatch.score) {
                    bestMatch = { score: currentScore, answer: answerText };
                }
            });
            
            return bestMatch.score >= 0.8 ? bestMatch.answer : null;
        };

        // Voice Exit Commands
        if (isCallMode && (q.includes("stop") || q.includes("end call") || q.includes("goodbye") || q.includes("hang up") || q.includes("exit"))) {
            setTimeout(() => toggleCallMode(), 1500);
            return "Ending call. Goodbye!";
        }

        // 1. Try to find a custom answer in your System Prompt FAQ first
        const promptAnswer = findAnswerInPrompt(q);
        if (promptAnswer) return promptAnswer;

        // 2. Fallbacks for missing FAQ items - using direct fields without repeating intro
        if (q.includes("return") || q.includes("policy")) {
            return siteKnowledge.returnPolicy || persona || "You can return most items within 30 days. Please check your orders page for details.";
        }
        if (q.includes("who built") || q.includes("developer") || q.includes("wabi") || q.includes("author") || q.includes("created") || q.includes("founder") || q.includes("finder") || q.includes("creator") || q.includes("maker") || q.includes("engineer")) {
            return siteKnowledge.developerBio || persona || "This e-commerce platform was built and engineered by Wabi using modern web technologies like React and Firebase.";
        }
        if (q.includes("shipping") || q.includes("delivery") || q.includes("location") || q.includes("ship")) {
            return siteKnowledge.shippingInfo || persona || "We offer fast shipping across the country. Typically orders arrive within 3 to 5 business days.";
        }
        if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
            return persona;
        }
        
        return "I am still learning, could you please be more specific to my website? I can answer questions about shipping, returns, security, and more!";
    };

    return (
        <div className={classes.chatbotContainer}>
            <button 
                className={classes.chatToggle} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? <FaTimes /> : <FaRobot />}
            </button>

            {showGreeting && !isOpen && (
                <div className={classes.greetingBubble} onClick={handleOpenChatFromGreeting}>
                    <button className={classes.closeGreeting} onClick={handleCloseGreeting}>
                        <FaTimes />
                    </button>
                    <div className={classes.greetingText}>
                        <p>Hey! Do you need help?</p>
                    </div>
                    <div className={classes.greetingArrow}></div>
                </div>
            )}

            {errorMessage && (
                <div className={classes.errorToast}>
                    {errorMessage}
                </div>
            )}

            {isOpen && (
                <div className={classes.chatWindow}>
                    <div className={classes.chatHeader}>
                        <div className={classes.headerTitle}>
                            <FaRobot className={classes.headerIcon} />
                            <div>
                                <h4>{siteKnowledge?.assistantName || "Amazon AI"}</h4>
                                <div className={classes.statusRow}>
                                    <span className={classes.statusDot}></span>
                                    <span>Online & Learning</span>
                                </div>
                            </div>
                        </div>
                        <div className={classes.headerActions}>
                            <button 
                                onClick={toggleCallMode} 
                                className={`${classes.actionBtn} ${isCallMode ? classes.activeCall : ''}`}
                                title="Start Voice Call"
                            >
                                <FaPhone />
                            </button>
                            <button onClick={() => setIsOpen(false)} className={classes.closeBtn}><FaTimes /></button>
                        </div>
                    </div>

                    <div className={classes.messagesList}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${classes.messageRow} ${msg.role === 'user' ? classes.userRow : classes.botRow}`}>
                                <div className={classes.avatar}>
                                    {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                                </div>
                                <div className={classes.messageContent}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={classes.typingIndicator}>
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {isCallMode && (
                        <div className={classes.callOverlay}>
                            <div className={classes.callContent}>
                                <div className={`${classes.pulseCircle} ${isSpeechDetected ? classes.speechDetected : isListening ? classes.listening : isSpeaking ? classes.activeSpeaking : ''}`}>
                                    <FaRobot />
                                </div>
                                <h3>
                                    {isSpeaking ? "AI is speaking..." : 
                                     isTyping ? "AI is thinking..." : 
                                     isSpeechDetected ? "I hear you..." : "I'm Listening..."}
                                </h3>
                                {interimTranscript && (
                                    <div className={classes.interimTranscript}>
                                        "{interimTranscript}"
                                    </div>
                                )}
                                <div className={`${classes.visualizer} ${isListening || isSpeaking ? classes.recording : ''}`}>
                                    <span></span><span></span><span></span><span></span><span></span>
                                </div>
                                <button onClick={toggleCallMode} className={classes.endCallBtn}>
                                    <FaPhoneSlash /> End Call
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className={classes.inputArea}>
                        <input 
                            type="text" 
                            placeholder="Ask me anything..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()}><FaPaperPlane /></button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
