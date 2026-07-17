import Lead from "../models/Lead.js";
import { logAudit } from "../utils/auditLogger.js";

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.status(200).json(leads);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();

    logAudit(
      req,
      "CREATE",
      "Sales",
      lead._id,
      `CRM Lead registered: ${lead.name} (${lead.email || "No email"})`,
      { name: lead.name, company: lead.company, status: lead.status }
    );

    return res.status(201).json(lead);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    logAudit(
      req,
      "UPDATE",
      "Sales",
      lead._id,
      `CRM Lead details updated: ${lead.name} - status: ${lead.status}`,
      req.body
    );

    return res.status(200).json(lead);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    await Lead.findByIdAndDelete(req.params.id);

    logAudit(
      req,
      "DELETE",
      "Sales",
      lead._id,
      `CRM Lead deleted: ${lead.name} (${lead.company || "No company"})`,
      { name: lead.name, company: lead.company }
    );

    return res.status(200).json({ message: "Lead deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLeadSummary = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: "New" });
    const wonLeads = await Lead.countDocuments({ status: "Won" });
    const lostLeads = await Lead.countDocuments({ status: "Lost" });

    return res.status(200).json({ totalLeads, newLeads, wonLeads, lostLeads });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
