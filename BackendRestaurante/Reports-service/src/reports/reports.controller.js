import Report from './reports.model.js';

const buildSummary = (data = {}, metrics = []) => {
  if (metrics.length) {
    return metrics.reduce((acc, metric) => {
      acc[metric.label] = metric.value;
      return acc;
    }, {});
  }

  if (Array.isArray(data)) {
    return { totalRecords: data.length };
  }

  if (data && typeof data === 'object') {
    return { totalFields: Object.keys(data).length };
  }

  return {};
};

export const createReport = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      summary: req.body.summary || buildSummary(req.body.data, req.body.metrics),
    };
    const report = await Report.create(payload);
    res.status(201).json({ success: true, message: 'Reporte creado', report });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.generatedBy) filters.generatedBy = req.query.generatedBy;
    if (req.query.sourceService) filters.sourceService = req.query.sourceService;
    if (req.query.tag) filters.tags = req.query.tag;

    if (req.query.start || req.query.end) {
      filters.createdAt = {};
      if (req.query.start) filters.createdAt.$gte = new Date(req.query.start);
      if (req.query.end) filters.createdAt.$lte = new Date(req.query.end);
    }

    const reports = await Report.find(filters).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.body.data || req.body.metrics) {
      payload.summary = req.body.summary || buildSummary(req.body.data, req.body.metrics || []);
    }

    const report = await Report.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.status(200).json({ success: true, message: 'Reporte actualizado', report });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.status(200).json({ success: true, message: 'Reporte eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const archiveReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.status(200).json({ success: true, message: 'Reporte archivado', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.type': 1, '_id.status': 1 } },
    ]);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
