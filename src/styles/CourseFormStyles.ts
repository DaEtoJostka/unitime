import styled from 'styled-components';

export const FormContainer = styled.div`
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  @media (max-width: 768px) {
    gap: 4px;
  }
`;

export const Label = styled.label`
  font-weight: 500;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 16px; /* Prevent auto-zoom on iOS */
  }
`;

export const OptionIndicator = styled.span<{ color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${props => props.color};
  margin-right: 6px;
  vertical-align: middle;
  flex-shrink: 0;
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 36px;
  background: #2196f3;
  color: white;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;

  &:hover {
    background: #1976d2;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    background: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 44px;
    font-size: 16px;
    justify-content: center;
    width: 100%;
  }
`;

export const DeleteButton = styled(Button)`
  background: #f44336;
  color: white;
  border: 1px solid #f44336;
  margin-left: auto;

  &:hover {
    background: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 10px;
  }
`;

export const DuplicateButton = styled(Button)`
  background: #4CAF50;
  color: white;
  border: 1px solid #4CAF50;
  margin-left: auto;

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 10px;
  }
`;

export const CustomSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 16px; /* Prevent auto-zoom on iOS */
  }
`;

export const OptionsList = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  width: 100%;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 100;
  
  @media (max-width: 768px) {
    max-height: 200px;
    overflow-y: auto;
  }
`;

export const OptionItem = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$isSelected ? '#f5f5f5' : 'white'};

  &:hover {
    background: #f8f8f8;
  }
`;

