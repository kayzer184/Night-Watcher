import React from "react";
import ProgressBar from "@ramonak/react-progress-bar";

function Interface({NPCMood, Energy}) {
    return (
        <div className="Interface">
            <ProgressBar completed={NPCMood} />
            <ProgressBar completed={Energy} />
        </div>
    )
}

export default Interface