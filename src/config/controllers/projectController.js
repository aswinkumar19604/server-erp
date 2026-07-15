import Project from "../models/Project.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProjectSummary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const progress = await Project.countDocuments({ status: "In Progress" });
    const completed = await Project.countDocuments({ status: "Completed" });
    const onHold = await Project.countDocuments({ status: "On Hold" });

    return res.status(200).json({ totalProjects, progress, completed, onHold });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
