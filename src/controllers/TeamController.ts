import {Response, Request} from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const {email} = req.body

        // Find user
        const user = await User.findOne({email}).select('id email name')
        if(!user){
            const error = new Error('usuario no encontrado')
            return res.status(404).json({error: error.message})
        }

        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        try {
            // Obtener el proyecto con team y manager poblados
            const project = await Project.findById(req.project.id).populate([
            {
                path: 'team',
                select: 'id name email',
            },
            {
                path: 'manager',
                select: 'id name email',
            },
            ]);

            // Obtener IDs de managers para filtrar duplicados
            const managerIds = (project.manager || []).map((manager) => manager.id.toString());

            // Filtrar managers, excluyendo al usuario autenticado
            const managers = (project.manager || [])
            .filter((manager) => manager.id.toString() !== req.user.id.toString())

            // Filtrar colaboradores (team), excluyendo managers y usuario autenticado
            const collaborators = (project.team || [])
            .filter(
                (member) =>
                member.id.toString() !== req.user.id.toString() &&
                !managerIds.includes(member.id.toString())
            )

            // Devolver objeto con dos arreglos
            res.json({ managers, collaborators });
        } catch (error) {
            console.error('Error al obtener el equipo:', error);
            res.status(500).json({ error: 'Error al obtener el equipo del proyecto' });
        }
        };

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body;

        // Find user
        const user = await User.findById(id).select('id');
        if (!user) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ error: error.message });
        }

        // Verificar si el usuario ya está en el equipo o como manager
        if (
            req.project.team.some((team) => team.toString() === user.id.toString()) ||
            req.project.manager.some((manager) => manager.toString() === user.id.toString())
        ) {
            const error = new Error('Este usuario ya está en el proyecto como miembro o manager');
            return res.status(409).json({ error: error.message });
        }

        req.project.team.push(user.id);
        await req.project.save();

        res.send('Usuario agregado correctamente');
    };

    static removeMemberById = async (req: Request, res: Response) => {
        const {userId} = req.params

        if(!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('Este usuario no existe en el proyecto')
            return res.status(409).json({error: error.message})
        }

        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId)

        await req.project.save() 

        res.send('Usuario eliminado correctamente')
    }
}