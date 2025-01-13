import Modal from 'react-modal';
import Button from '../Button';

interface IConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, children }: IConfirmModalProps) => {
  return (
    <Modal style={customStyles} isOpen={isOpen} onRequestClose={onClose}>
      {children}
      <div className="flex justify-center mt-4 gap-2">
        <Button type="primary" onClick={onConfirm}>
          Potvrdujem
        </Button>
        <Button type="black" onClick={onClose}>
          Natrag
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
