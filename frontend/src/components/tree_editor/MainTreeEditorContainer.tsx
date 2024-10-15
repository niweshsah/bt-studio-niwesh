import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import TreeEditor from "./TreeEditor";
import {
  getProjectGraph,
  getSubtree,
  saveSubtree,
} from "../../api_helper/TreeWrapper";

const MainTreeEditorContainer = ({
  projectName,
  setProjectEdited,
  setGlobalJson,
}: {
  projectName: string;
  setProjectEdited: React.Dispatch<React.SetStateAction<boolean>>;
  setGlobalJson: Function;
}) => {
  // STATES

  const [initialJson, setInitialJson] = useState("");
  const [resultJson, setResultJson] = useState("");
  const [subTreeName, setSubTreeName] = useState("");
  const [treeHierarchy, setTreeHierarchy] = useState([] as string[]);
  const [goBack, setGoBack] = useState(false);
  const [wentBack, setWentBack] = useState(false);

  // HELPERS

  const fetchTree = async () => {
    try {
      const graph_json = subTreeName
        ? await getSubtree(subTreeName, projectName)
        : await getProjectGraph(projectName);
      setInitialJson(graph_json);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
      }
    }
  };

  const saveSubtreeJson = async (
    previousResultJson: string,
    previousName: string
  ) => {
    try {
      await saveSubtree(previousResultJson, projectName, previousName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
      }
    }
  };

  const trackTreeHierarchy = (newSubTreeName: string) => {
    if (newSubTreeName && !treeHierarchy.includes(newSubTreeName)) {
      console.log("Adding to hierarchy: ", newSubTreeName);
      setTreeHierarchy((prevHierarchy) => [...prevHierarchy, newSubTreeName]);
    }
  };

  // EFFECTS

  useEffect(() => {
    // When no subtree is selected, set the global json
    if (!subTreeName) {
      setGlobalJson(resultJson);
    }
  }, [resultJson]);

  useEffect(() => {
    if (subTreeName && !wentBack) {
      console.log("Tracking hierarchy!");
      trackTreeHierarchy(subTreeName);

      // Check if there's at least one item in the hierarchy before attempting to save
      const currentHierarchy = treeHierarchy;
      const previousResultJson = resultJson;
      const previousSubTreeName = treeHierarchy[currentHierarchy.length - 1];

      console.log("Current hierarchy: ", currentHierarchy);
      console.log("Saving subtree: ", previousSubTreeName);
      console.log("Previous result JSON before saving: ", previousResultJson);
      if (previousSubTreeName) {
        saveSubtreeJson(previousResultJson, previousSubTreeName); // Save the correct previous subtree
      }
    }

    // We can go back again now
    setWentBack(false);

    // Fetch the new subtree or project graph
    fetchTree();
    console.log("Getting graph!");
  }, [projectName, subTreeName]);

  useEffect(() => {
    if (goBack) {
      setTreeHierarchy((prevHierarchy) => {
        const newHierarchy = prevHierarchy.slice(0, -1);
        setSubTreeName(newHierarchy[newHierarchy.length - 1] || "");
        return newHierarchy;
      });
      setGoBack(false);
      setWentBack(true);
    }
  }, [goBack]);

  // Add a new useEffect to log the updated treeHierarchy
  useEffect(() => {
    console.log("Updated Subtree hierarchy: ", treeHierarchy);
  }, [treeHierarchy]);

  return (
    <div id="editor-container">
      {initialJson ? (
        <TreeEditor
          modelJson={initialJson}
          setResultJson={setResultJson}
          projectName={projectName}
          setDiagramEdited={setProjectEdited}
          hasSubtrees={true}
          setSubTreeName={setSubTreeName}
          setGoBack={setGoBack}
        />
      ) : (
        <p>Loading...</p> // Display a loading message until the graph is fetched
      )}
    </div>
  );
};

export default MainTreeEditorContainer;
