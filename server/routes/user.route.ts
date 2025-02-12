import express from "express"
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from "../controllers/user.controller"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import userModel from "../models/user.model"
const userRouter = express.Router()

userRouter.post('/registration', registrationUser)
userRouter.post('/activate-user', activateUser)
userRouter.post('/login', loginUser)
userRouter.get('/logout', isAuthenticated, logoutUser)
// userRouter.get('/refresh', updateAccessToken)
userRouter.get('/me', isAuthenticated, getUserInfo)
userRouter.post('/social-auth', socialAuth)
userRouter.put('/update-user-info', isAuthenticated, updateUserInfo)
userRouter.put('/update-user-password', isAuthenticated, updatePassword)
userRouter.put('/update-user-avatar', isAuthenticated, updateProfilePicture)
userRouter.get('/get-users', isAuthenticated, authorizeRoles("admin"), getAllUsers)
userRouter.put('/update-user', isAuthenticated, authorizeRoles("admin"), updateUserRole)
userRouter.delete('/delete-user', isAuthenticated, authorizeRoles("admin"), deleteUser)
userRouter.get('/user-counselors/:userId', isAuthenticated, async (req, res) => {
    const user = await userModel.findById(req.params.userId).populate("purchasedCounselors");
    res.json(user?.purchasedCounselors || []);
  })
userRouter.get('/counselor-students/:counselorId', isAuthenticated,  async (req, res) => {
    const counselor = await userModel.findById(req.params.counselorId).populate("students");
    res.json(counselor?.students || []);
  })

export default userRouter 