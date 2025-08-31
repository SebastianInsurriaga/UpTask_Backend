import {Router} from 'express'
import {body, param} from 'express-validator'
import { AuthController } from '../controllers/AuthControler'
import { handleInputErrors } from '../middleware/validation'
import { authenticate } from '../middleware/auth'

const router = Router()

/**
 * @openapi
 * /api/auth/create-account:
 *   post:  
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: name
 *               password:
 *                 type: string
 *                 example: "password"
 *               password_confirmation:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Account created succesfully
 *       409:
 *         description: This user already exists
 *       500:
 *         description: Error
 */
router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('password')
        .isLength({min: 8}).withMessage('El password es muy corto, debe ser minimo 8 caracteres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password)
            throw new Error('Los password no son iguales')
        return true
    }),
    body('email')
        .isEmail().withMessage('El email no es valido'),
    handleInputErrors,
    AuthController.createAccount
)

/**
 * @openapi
 * /api/auth/confirm-account:
 *   post:  
 *     description: If the token is correct, confirms the account
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *     responses:
 *       200:
 *         description: Account confirmed succesfully
 *       404:
 *         description: Invalid token
 *       500:
 *         description: Error
 */
router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('El token no puede ir vacio'),
    handleInputErrors,
    AuthController.confirmAccount
)

/**
 * @openapi
 * /api/auth/login:
 *   post:  
 *     summary: Log in to the app
 *     description: Return a json web token if credentials are correct.
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *               password:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: log in successfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Error
 */

router.post('/login',
    body('email')
        .isEmail().withMessage('El email no es valido'),
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
)

/**
 * @openapi
 * /api/auth/request-code:
 *   post:  
 *     summary: Request new token
 *     description: Creates a new token and sends an email
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *     responses:
 *       200:
 *         description: New token sent
 *       409:
 *         description: This user is not registered
 *       403:
 *         description: This user is already confirmed
 *       500:
 *         description: Error
 */
router.post('/request-code',
    body('email')
        .isEmail().withMessage('El email no es valido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:  
 *     summary: Sends instructions to change password
 *     description: If user forgot its password, generates a new token and sends an email whit instructions to change password.
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *     responses:
 *       200:
 *         description: Email sent correctly
 *       409:
 *         description: This user is not registered
 *       500:
 *         description: Error
 */
router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('El email no es valido'),
    handleInputErrors,
    AuthController.forgotPassword
)

/**
 * @openapi
 * /api/auth/validate-token:
 *   post:  
 *     description: Validates the token actually exists.
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *     responses:
 *       200:
 *         description: Token is correct
 *       404:
 *         description: Invalid token
 *       500:
 *         description: Error
 */
router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('El token no puede ir vacio'),
    handleInputErrors,
    AuthController.validateToken
)

/**
 * @openapi
 * /api/auth/update-password:
 *   post:  
 *     summary: Update the password with new token
 *     description: If the token is correct, then the user can change its password.
 *     tags:
 *       - Autentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *               password:
 *                 type: string
 *                 example: "password"
 *               password_confirmation:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Password updated succesfully
 *       404:
 *         description: Invalid token
 *       500:
 *         description: Error
 */
router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no valido'),
    body('password')
        .isLength({min: 8}).withMessage('El password es muy corto, debe ser minimo 8 caracteres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password)
            throw new Error('Los password no son iguales')
        return true
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

/**
 * @openapi
 * /api/auth/user:
 *   get:  
 *     summary: Get the authenticated user
 *     description: Takes a json web token and returns the user.
 *     tags:
 *       - Autentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "689cf8d37dd65f80e4d..."
 *                 email:
 *                   type: string
 *                   example: "ususario@correo.com"
 *                 name:
 *                   type: string
 *                   example: "name"
 *       401:
 *         description: Not authorized - Token missing or invalid 
 *       500:
 *         description: Error
 */
router.get('/user',
    authenticate,
    AuthController.user
)

/* Profile */

/**
 * @openapi
 * /api/auth/profile:
 *   put:  
 *     summary: Update profile data
 *     tags:
 *       - Autentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                   type: string
 *                   example: "name"
 *               email:
 *                   type: string
 *                   example: "ususario@correo.com"
 *     responses:
 *       200:
 *         description: Profile updated correclty
 *       409:
 *         description: This email already exists
 *       500:
 *         description: Error
 */
router.put('/profile',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email')
        .isEmail().withMessage('El email no es valido'),
    handleInputErrors,
    AuthController.updateProfile
)

/**
 * @openapi
 * /api/auth/update-password:
 *   post:  
 *     summary: Update password while user is login
 *     tags:
 *       - Autentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                   type: string
 *                   example: "current password"
 *               password:
 *                   type: string
 *                   example: "password"
 *               password_confirmation:
 *                   type: string
 *                   example: "password"
 *     responses:
 *       200:
 *         description: Password updated correctly
 *       401:
 *         description: Actual password is incorrect
 *       500:
 *         description: Error
 */
router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('El password actual no debe ir vacio'),
    body('password')
        .isLength({min: 8}).withMessage('El password es muy corto, debe ser minimo 8 caracteres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password)
            throw new Error('Los password no son iguales')
        return true
    }),
    handleInputErrors,
    AuthController.updateProfileUserPassword
)

/**
 * @openapi
 * /api/auth/check-password:
 *   post:  
 *     tags:
 *       - Autentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                   type: string
 *                   example: "password"
 *     responses:
 *       200:
 *         description: Correct password
 *       401:
 *         description: Incorrect password
 *       500:
 *         description: Error
 */
router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('El password no debe ir vacio'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router