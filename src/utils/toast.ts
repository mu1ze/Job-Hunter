import toast from 'react-hot-toast'

/**
 * Toast notification utilities with consistent styling
 */

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    })
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
    })
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

// Pre-configured toast messages for common actions
export const toastMessages = {
  job: {
    saved: 'Job saved successfully! 🎯',
    removed: 'Job removed from saved list',
    saveFailed: 'Failed to save job. Please try again.',
    removeFailed: 'Failed to remove job. Please try again.',
  },
  resume: {
    uploaded: 'Resume uploaded successfully! 📄',
    uploadFailed: 'Failed to upload resume. Please try again.',
    parsed: 'Resume parsed with AI! ✨',
    parseFailed: 'Failed to parse resume. Please try again.',
  },
  document: {
    generated: 'Document generated! 🎉',
    generationFailed: 'Failed to generate document. Please try again.',
    copied: 'Copied to clipboard! 📋',
    copyFailed: 'Failed to copy to clipboard.',
  },
  auth: {
    signedIn: 'Welcome back! 👋',
    signedOut: 'Signed out successfully',
    signInFailed: 'Failed to sign in. Please check your credentials.',
    signUpSuccess: 'Account created! Welcome! 🎉',
    signUpFailed: 'Failed to create account. Please try again.',
  },
  general: {
    updateSuccess: 'Updated successfully! ✅',
    updateFailed: 'Update failed. Please try again.',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Delete failed. Please try again.',
  },
  error: {
    urlReadable: "Uh oh! I can't read that URL. It might be blocked or private. Try pasting the description instead! 🙈",
    descriptionParse: "I'm having trouble understanding this job description. It seems a bit garbled. Could you try cleaning it up? 🧹",
    noJobsFound: "I couldn't find any jobs matching that. Maybe try broader keywords? The perfect role is hiding somewhere! 🕵️‍♂️",
    aiBusy: "My AI brain is a bit overloaded right now. Give me a moment to cool down and try again! 🤯",
    networkError: "Network gremlins are at it again. Please check your connection! 🔌",
    generic: "Something went wrong. I'm looking into it! 🧐"
  }
}
