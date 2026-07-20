import React, { createContext, useContext, useState, useEffect } from "react";

const defaultStudentInfo = {
  name: "Ammar Meman",
  username: "ammar_meman",
  rollNumber: "CGCE241234",
  college: "B.E. Computer Engineering",
  department: "Computer Science",
  year: "1st Year",
  email: "ammar.meman@example.com",
  phone: "+91 9876543210",
  profileImage: "https://api.dicebear.com/7.x/avataaars/png?seed=ammar",
};

const initialMockSurveys = [
  {
    id: "SURVEY-2026-001",
    siteName: "Village Water Source Inspection",
    clientName: "Public Health Engineering Department",
    description: "Conducted chemical analysis and source sanitation check.",
    priority: "High",
    date: "17 Jul 2026",
    location: { latitude: 23.8432, longitude: 72.3921, accuracy: 4.2 },
    contact: { name: "Ramesh Patel", phoneNumber: "+91 9988776655" },
    notes: "Chikhli, Banaskantha. Water source is highly contaminated. Recommended filtration.",
    photo: "https://picsum.photos/id/1018/400/300",
    status: "Completed",
    time: "09:30 AM",
  },
  {
    id: "SURVEY-2026-002",
    siteName: "Road Condition Survey",
    clientName: "Roads & Buildings Department",
    description: "Inspection of Palanpur-Desa highway cracks and potholes.",
    priority: "Medium",
    date: "17 Jul 2026",
    location: { latitude: 24.1722, longitude: 72.4343, accuracy: 6.8 },
    contact: { name: "Harshil Vyas", phoneNumber: "+91 8877665544" },
    notes: "Palanpur, Gujarat. Bitumen laying quality is poor. Core cracking visible.",
    photo: "https://picsum.photos/id/1020/400/300",
    status: "In Progress",
    time: "11:15 AM",
  },
  {
    id: "SURVEY-2026-003",
    siteName: "Public Infrastructure Check",
    clientName: "Urban Development Authority",
    description: "Pillar load audit at public auditorium.",
    priority: "Low",
    date: "16 Jul 2026",
    location: { latitude: 24.3211, longitude: 72.2988, accuracy: 12.0 },
    contact: { name: "K. R. Solanki", phoneNumber: "+91 7766554433" },
    notes: "Dantiwada, Banaskantha. Scaffolding is weak. Alignment requires correction.",
    photo: "https://picsum.photos/id/1021/400/300",
    status: "Pending",
    time: "04:45 PM",
  },
];

const SurveyContext = createContext(undefined);

export const SurveyProvider = ({ children }) => {
  const [surveys, setSurveys] = useState(initialMockSurveys);
  const [currentSurvey, setCurrentSurvey] = useState({
    siteName: "",
    clientName: "",
    description: "",
    priority: "",
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    notes: "",
  });
  const [studentInfo, setStudentInfo] = useState(defaultStudentInfo);

  // Load initial data on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const savedSurveys = window.localStorage.getItem("surveys");
        if (savedSurveys) {
          setSurveys(JSON.parse(savedSurveys));
        }
        const savedInfo = window.localStorage.getItem("studentInfo");
        if (savedInfo) {
          setStudentInfo(JSON.parse(savedInfo));
        }
      }
    } catch (e) {
      console.log("Error loading persisted data", e);
    }
  }, []);

  // Persist surveys when they change
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("surveys", JSON.stringify(surveys));
      }
    } catch (e) {
      console.log("Error saving surveys", e);
    }
  }, [surveys]);

  // Persist studentInfo when it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("studentInfo", JSON.stringify(studentInfo));
      }
    } catch (e) {
      console.log("Error saving studentInfo", e);
    }
  }, [studentInfo]);

  // Today's survey count logic
  const getTodaySurveyCount = () => {
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    // Format checking matching e.g. "17 Jul 2026"
    return surveys.filter((s) => s.date.includes(todayStr) || s.date === "17 Jul 2026").length;
  };

  const updateCurrentSurvey = (fields) => {
    setCurrentSurvey((prev) => ({ ...prev, ...fields }));
  };

  const resetCurrentSurvey = () => {
    setCurrentSurvey({
      siteName: "",
      clientName: "",
      description: "",
      priority: "",
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      notes: "",
      photo: undefined,
      captureTime: undefined,
      contact: undefined,
      location: undefined,
    });
  };

  const submitCurrentSurvey = () => {
    if (
      !currentSurvey.siteName ||
      !currentSurvey.clientName ||
      !currentSurvey.description ||
      !currentSurvey.priority ||
      !currentSurvey.date
    ) {
      return { success: false, error: "Please fill all required fields." };
    }

    const newId = `SURVEY-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newSurvey = {
      id: newId,
      siteName: currentSurvey.siteName,
      clientName: currentSurvey.clientName,
      description: currentSurvey.description,
      priority: currentSurvey.priority,
      date: currentSurvey.date,
      photo: currentSurvey.photo,
      captureTime: currentSurvey.captureTime,
      contact: currentSurvey.contact,
      location: currentSurvey.location,
      notes: currentSurvey.notes || "",
      status: "Completed",
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    resetCurrentSurvey();
    return { success: true };
  };

  const deleteSurvey = (id) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStudentInfo = (info) => {
    setStudentInfo((prev) => ({ ...prev, ...info }));
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        currentSurvey,
        studentInfo,
        updateCurrentSurvey,
        resetCurrentSurvey,
        submitCurrentSurvey,
        deleteSurvey,
        updateStudentInfo,
        todaySurveyCount: getTodaySurveyCount(),
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyProvider");
  }
  return context;
};
