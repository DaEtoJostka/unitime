import styled from 'styled-components';

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
  
  &.peer-disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`; 