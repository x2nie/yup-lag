import { createContext } from "react";
import ReactTooltip from "react-tooltip";
import { createRoot } from "react-dom/client";
import { Program } from "./program";
import { ControlPanel } from "./center";
import { LeftPanel } from "./left";
import { MobileSelect } from "./mobile";
import { RightPanel } from "./right";

import "./style/index.css";

export const ProgramContext = createContext<typeof Program>(null);

const App = () => {
    return (
        <ProgramContext.Provider value={Program}>
            <LeftPanel />
            <ControlPanel />
            <RightPanel />
            <MobileSelect />
            <ReactTooltip className="tooltip" />
        </ProgramContext.Provider>
    );
};

const root = createRoot(document.getElementById("app"));
root.render(<App />);
