import Modal from 'react-modal';
import Button from '@app/components/Button';
import { FiX } from 'react-icons/fi';

interface IConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

if (typeof document !== 'undefined' && document.querySelector('#root')) {
  Modal.setAppElement('#root');
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(100vw - 2rem, 34rem)',
    padding: 0,
    border: '1px solid #dce4ff',
    borderRadius: '1.5rem',
    background: '#ffffff',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.22)',
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
  },
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, children }: IConfirmModalProps) => {
  const hasAppElement = typeof document !== 'undefined' && Boolean(document.querySelector('#root'));

  return (
    <Modal
      style={customStyles}
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={hasAppElement}
      contentLabel="Potvrda radnje"
    >
      <div className="relative bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff] px-5 py-6 text-center sm:px-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-[#dce4ff] bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          aria-label="Zatvori"
        >
          <FiX size={18} />
        </button>

        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-rose text-red shadow-sm">
          !
        </div>

        <div className="mx-auto max-w-md text-gray-900">{children}</div>

        <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Button
            type="secondary"
            className="rounded-full border border-[#dce4ff] px-6 py-3 font-semibold text-gray-900 hover:!bg-[#f7f9ff] hover:!text-gray-900"
            onClick={onClose}
          >
            Natrag
          </Button>
          <Button
            type="blue"
            className="rounded-full px-6 py-3 font-semibold shadow-md shadow-blue/20"
            onClick={onConfirm}
          >
            Potvrđujem
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
