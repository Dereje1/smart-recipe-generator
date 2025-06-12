import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Button,
} from '@headlessui/react';

interface DeleteDialogProps {
    isOpen: boolean
    recipeName: string
    closeDialog: () => void
    deleteRecipe: ()=> void
}
function DeleteDialog({ isOpen, closeDialog, recipeName, deleteRecipe }: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={closeDialog} className="relative z-modal-top">
            <DialogBackdrop className="fixed inset-0 bg-black/80" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg shadow-lg">
                    <DialogTitle className="text-xl font-bold">{`Permanently delete ${recipeName} ?`}</DialogTitle>
                    <div className="flex gap-4 flex-end">
                        <Button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400" onClick={closeDialog}>Cancel</Button>
                        <Button
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 data-[disabled]:bg-gray-200"
                            onClick={deleteRecipe}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default DeleteDialog
