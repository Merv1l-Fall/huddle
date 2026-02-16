'use client'
import { useAuthStore } from "@/lib/store/authStore";
import "./setup.css";
import SetupUserForm from "@/components/forms/SetupUserForm";

const Setup = () => {

	return (
		<div className="setup-wrapper">
			<div className="setup-main-container">
				<div className="setup-top-container">
					<h1>Setup your profile</h1>
					<p>Chose your username, This name will be permanent and visible to other users. Your <i>display name</i> can be changed later</p>
				</div>
				<SetupUserForm />
			</div>
		</div>
	)
}

export default Setup;