import {Router} from 'express'
import {body, param} from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { ProjectExists } from '../middleware/project'
import { hasAuthorization, taskBelongsToProject, taskExists } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamController'
import { NoteController } from '../controllers/NoteController'

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/projects/:
 *   post:  
 *     summary: Creates a new project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                   type: string
 *                   example: "name"
 *               clientName:
 *                   type: string
 *                   example: "client name"
 *               description:
 *                   type: string
 *                   example: "description of the project"
 *     responses:
 *       200:
 *         description: Project created succesfully
 *       500:
 *         description: Server error
 */
router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)

/**
 * @openapi
 * /api/projects/:
 *   get:
 *     summary: Get all projects for the authenticated user
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: './models/Project'
 *       500:
 *         description: Server error
 */
router.get('/', ProjectController.getAllProjects)

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: './models/Project'
 *       404:
 *         description: Project not found or unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById)

router.param('projectId', ProjectExists) /* para todas las rutas con projectId */ 

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: "New Project Name"
 *               clientName:
 *                 type: string
 *                 example: "Updated Client"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put('/:projectId', 
    param('projectId').isMongoId().withMessage('ID no valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject)

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete('/:projectId', 
    param('projectId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject)

/* Routes for Tasks */
 
/**
 * @openapi
 * /api/projects/{projectId}/task:
 *   post:
 *     summary: Create a new task inside an existing project
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Design homepage"
 *               description:
 *                 type: string
 *                 example: "Create initial design for the homepage"
 *     responses:
 *       200:
 *         description: Task created successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.post('/:projectId/task',
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

/**
 * @openapi
 * /api/projects/{projectId}/task:
 *   get:
 *     summary: Get all tasks from an existing project
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Tasks founded
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: './models/Task'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/:projectId/task',
    TaskController.getProjectTask
)

router.param('taskId', taskExists) /* para todas las rutas con taskId */ 
router.param('taskId', taskBelongsToProject)

/**
 * @openapi
 * /api/projects/{projectId}/task/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTaskByID
)

/**
 * @openapi
 * /api/projects/{projectId}/task/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Update UI"
 *               description:
 *                 type: string
 *                 example: "Refactor homepage design"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/:projectId/task/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

/**
 * @openapi
 * /api/projects/{projectId}/task/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:projectId/task/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask
)

/**
 * @openapi
 * /api/projects/{projectId}/task/{taskId}/status:
 *   post:
 *     summary: Update task status
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.post('/:projectId/task/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateTaskStatus
)

/* Routes for teams */

/**
 * @openapi
 * /api/projects/{projectId}/team/find:
 *   post:
 *     summary: Find a member by email
 *     description: Search a user by email to add them as a project team member.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@correo.com"
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64bfc72ee29f123456789abc"
 *                 email:
 *                   type: string
 *                   example: "usuario@correo.com"
 *                 name:
 *                   type: string
 *                   example: "name"
 *       404:
 *         description: User not found
 */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)


/**
 * @openapi
 * /api/projects/{projectId}/team:
 *   get:
 *     summary: Get project team
 *     description: Returns the list of team members for a given project.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project.
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
)

/**
 * @openapi
 * /api/projects/{projectId}/team:
 *   post:
 *     summary: Add member to project
 *     description: Adds a user to the project team by their ID.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64bfc72ee29f123456789abc"
 *     responses:
 *       200:
 *         description: User added successfully
 *       404:
 *         description: User not found
 *       409:
 *         description: User already exists in the project
 */
router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

/**
 * @openapi
 * /api/projects/{projectId}/team/{userId}:
 *   delete:
 *     summary: Remove member from project
 *     description: Removes a user from the project team.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project.
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to remove.
 *     responses:
 *       200:
 *         description: User removed successfully
 *       409:
 *         description: User does not exist in the project
 */
router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

/* Routes for Notes */

/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}/notes:
 *   post:
 *     summary: Create a note for a task
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is an important note about the task"
 *     responses:
 *       200:
 *         description: Note created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}/notes:
 *   get:
 *     summary: Get all notes for a task
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: List of notes for the task
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64fa0b8e2c1234567890abcd"
 *                   content:
 *                     type: string
 *                     example: "This is an important note"
 *                   createdBy:
 *                     type: string
 *                     example: "64f9ef7a2c1234567890abcd"
 *                   task:
 *                     type: string
 *                     example: "64f8cd9e2c1234567890abcd"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}/notes/{noteId}:
 *   delete:
 *     summary: Delete a note from a task
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID (MongoDB ObjectId)
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found or unauthorized action
 *       500:
 *         description: Server error
 */
router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router