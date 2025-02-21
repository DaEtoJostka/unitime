import styled from 'styled-components';
import { MdKeyboardArrowDown } from 'react-icons/md';
import * as React from 'react';

export const SelectNativeWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledSelect = styled.select`
  appearance: none;
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ChevronWrapper = styled.span`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
`;

interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ children, ...props }, ref) => (
    <SelectNativeWrapper>
      <StyledSelect ref={ref} {...props}>
        {children}
      </StyledSelect>
      <ChevronWrapper>
        <MdKeyboardArrowDown size={18} />
      </ChevronWrapper>
    </SelectNativeWrapper>
  )
);
SelectNative.displayName = 'SelectNative'; 