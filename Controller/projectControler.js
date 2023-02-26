const Projects = require('../Schema/projectSchema');
const AsyncHandler = require('express-async-handler');
const AppErr = require('../Middlewares/AppError');
const imageUpload = require('../Utility/imageUpload');

exports.getAll = AsyncHandler(async (req, res, next) => {
  const projects = await Projects.find();
  if (!projects) {
    return next(new AppErr('Invalid request.', 403));
  }
  res.status(200).json(projects);
});

exports.getSingleProject = AsyncHandler(async (req, res, next) => {
  const project = await Projects.findOne(req.projects);
  if (!project) {
    return next(new AppErr('No project found that Id.', 403));
  }
  res.status(200).json(project);
});

exports.addProject = AsyncHandler(async (req, res, next) => {
  const { name, type, category, author } = req.body;

  const imageUrl = await imageUpload(req, 'Homerun');

  const newProject = await Projects.create({
    name,
    type,
    category,
    image: imageUrl,
    author,
  });
  if (!newProject) {
    return next(new AppErr('Failed to add project. Please try again', 403));
  }

  res.status(201).json({
    message: 'success',
    newProject,
  });
});

exports.editProject = AsyncHandler(async (req, res, next) => {
  const { name, type, category, author } = req.body;

  const imageUrl = await imageUpload(req, 'Homerun');
  const currentCover = await Projects.findById(req.params.projectId).select(
    '+image'
  );

  const updatedProject = await Projects.findByIdAndUpdate(
    req.params.projectId,
    {
      name,
      type,
      category,
      image: req.file ? imageUrl : currentCover.image,
      author,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProject) {
    return next(new AppErr('Failed to update project. Please try again.', 403));
  }

  res.status(200).json({
    message: 'success',
    updatedProject,
  });
});

exports.deleteProject = AsyncHandler(async (req, res, next) => {
  await Projects.findByIdAndDelete(req.params.projectId);
  res.status(201).json({
    data: null,
  });
});
