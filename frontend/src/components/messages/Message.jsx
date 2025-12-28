import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import Avatar from "../common/Avatar";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import useEditMessage from "../../hooks/useEditMessage";
import useMessageReaction from "../../hooks/useMessageReaction";
import { FiMoreVertical, FiTrash2, FiEdit2, FiSmile } from "react-icons/fi";
import toast from "react-hot-toast";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const fromMe = message.senderId?.toString() === authUser._id?.toString();
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "chat-end" : "chat-start";
	
	// Get profile pic
	const senderProfilePic = fromMe 
		? authUser.profilePic
		: selectedConversation?.profilePic;
	
	const bubbleBgColor = fromMe ? "bg-blue-500" : "";
	const shakeClass = message.shouldShake ? "shake" : "";

	const [showMenu, setShowMenu] = useState(false);
	const [showReactions, setShowReactions] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(message.message);
	const menuRef = useRef(null);
	const reactionRef = useRef(null);

	// Close menus when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
			if (reactionRef.current && !reactionRef.current.contains(event.target)) {
				setShowReactions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const { deleteMessage } = useDeleteMessage();
	const { editMessage } = useEditMessage();
	const { toggleReaction } = useMessageReaction();

	const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this message?")) {
			await deleteMessage(message._id);
			setShowMenu(false);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
		setEditText(message.message);
		setShowMenu(false);
	};

	const handleSaveEdit = async () => {
		if (editText.trim() && editText !== message.message) {
			await editMessage(message._id, editText);
		}
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditText(message.message);
	};

	const handleReaction = async (emoji) => {
		await toggleReaction(message._id, emoji, message.reactions);
		setShowReactions(false);
	};

	const userReaction = message.reactions?.find(
		(r) => r.userId?.toString() === authUser._id?.toString()
	);

	// Group reactions by emoji
	const reactionGroups = {};
	message.reactions?.forEach((reaction) => {
		if (!reactionGroups[reaction.emoji]) {
			reactionGroups[reaction.emoji] = [];
		}
		reactionGroups[reaction.emoji].push(reaction);
	});

	return (
		<div className={`chat ${chatClassName} group`}>
			<div className='chat-image avatar'>
				<Avatar src={senderProfilePic} alt="user avatar" size="md" />
			</div>
			<div className="flex flex-col gap-1">
				<div className="relative">
					{isEditing ? (
						<div className={`chat-bubble ${bubbleBgColor} text-white p-2`}>
							<input
								type="text"
								value={editText}
								onChange={(e) => setEditText(e.target.value)}
								className="w-full bg-transparent border-none outline-none text-white"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveEdit();
									if (e.key === "Escape") handleCancelEdit();
								}}
								autoFocus
							/>
							<div className="flex gap-2 mt-2">
								<button
									onClick={handleSaveEdit}
									className="text-xs px-2 py-1 bg-green-500 rounded hover:bg-green-600"
								>
									Save
								</button>
								<button
									onClick={handleCancelEdit}
									className="text-xs px-2 py-1 bg-gray-500 rounded hover:bg-gray-600"
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<>
							<div className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2 relative`}>
								{message.deleted ? (
									<span className="italic opacity-70">This message was deleted</span>
								) : (
									message.message
								)}
								{message.edited && !message.deleted && (
									<span className="text-xs opacity-50 ml-2">(edited)</span>
								)}
								
								{/* Message Actions Menu */}
								{fromMe && !message.deleted && (
									<div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
										<div className="relative">
											<button
												onClick={() => setShowMenu(!showMenu)}
												className="p-1 bg-gray-700 rounded hover:bg-gray-600"
											>
												<FiMoreVertical className="w-4 h-4" />
											</button>
											{showMenu && (
												<div className="absolute right-0 mt-1 bg-gray-700 rounded shadow-lg z-10 min-w-[120px]">
													<button
														onClick={handleEdit}
														className="flex items-center gap-2 px-3 py-2 hover:bg-gray-600 w-full text-left text-sm"
													>
														<FiEdit2 className="w-4 h-4" />
														Edit
													</button>
													<button
														onClick={handleDelete}
														className="flex items-center gap-2 px-3 py-2 hover:bg-gray-600 w-full text-left text-sm text-red-400"
													>
														<FiTrash2 className="w-4 h-4" />
														Delete
													</button>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Reaction Button */}
								{!message.deleted && (
									<div className="absolute -bottom-2 left-0 opacity-0 group-hover:opacity-100 transition-opacity" ref={reactionRef}>
										<div className="relative">
											<button
												onClick={() => setShowReactions(!showReactions)}
												className="p-1 bg-gray-700 rounded-full hover:bg-gray-600"
											>
												<FiSmile className="w-4 h-4" />
											</button>
											{showReactions && (
												<div className="absolute bottom-full left-0 mb-2 bg-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
													{quickReactions.map((emoji) => (
														<button
															key={emoji}
															onClick={() => handleReaction(emoji)}
															className={`text-xl p-1 rounded hover:bg-gray-600 transition-colors ${
																userReaction?.emoji === emoji ? "bg-blue-500" : ""
															}`}
														>
															{emoji}
														</button>
													))}
												</div>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Reactions Display */}
							{message.reactions && message.reactions.length > 0 && (
								<div className="flex gap-1 flex-wrap mt-1">
									{Object.entries(reactionGroups).map(([emoji, reactions]) => (
										<button
											key={emoji}
											onClick={() => handleReaction(emoji)}
											className={`text-xs px-2 py-1 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center gap-1 ${
												reactions.some(r => r.userId?.toString() === authUser._id?.toString())
													? "border border-blue-400"
													: ""
											}`}
										>
											<span>{emoji}</span>
											<span>{reactions.length}</span>
										</button>
									))}
								</div>
							)}
						</>
					)}
				</div>
				<div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
					{formattedTime}
					{message.edited && !message.deleted && <span>(edited)</span>}
				</div>
			</div>
		</div>
	);
};
export default Message;
