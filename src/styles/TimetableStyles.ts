import styled from 'styled-components';

export const TimetableContainer = styled.div`
  position: relative;
  overflow: hidden;
  padding: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  min-height: 600px;

  @media (max-width: 768px) {
    height: calc(100vh - 20px);
    min-height: 500px;
    border-radius: 4px;
    margin-top: 10px;
  }
`;

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;
  width: 100%;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    scroll-behavior: smooth;
  }
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 100px) repeat(6, minmax(120px, 1fr));
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  min-width: fit-content;
  position: sticky;
  top: 0;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: minmax(60px, 80px) repeat(6, minmax(90px, 1fr));
  }
`;

export const HeaderCell = styled.div<{ $isCurrent?: boolean; $isFirstDay?: boolean }>`
  box-sizing: border-box;
  padding: 12px 16px;
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 600;
  color: ${props => props.$isCurrent ? '#2196f3' : '#2d3748'};
  background: ${props => props.$isCurrent ? '#e3f2fd' : '#fff'};
  border-right: 1px solid #e0e0e0;
  line-height: 1.4;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
  position: relative;

  ${props => props.$isFirstDay && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 1px;
      background-color: #e0e0e0;
    }
  `}

  &:last-child {
    border-right: none;
  }

  ${props => props.$isCurrent && `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 3px;
      background: #2196f3;
    }
  `}
  
  @media (max-width: 768px) {
    padding: 8px 6px;
    font-size: clamp(12px, 3vw, 14px);
    min-width: 90px;
    gap: 2px;
  }
`;

export const RowsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
`;

export const TimeSlotRow = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 100px) repeat(6, minmax(120px, 1fr));
  border-bottom: 1px solid #e0e0e0;
  min-width: fit-content;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: minmax(60px, 80px) repeat(6, minmax(90px, 1fr));
  }
`;

export const CurrentTimeIndicator = styled.div`
  background-color: #0060e6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.15);
`;

export const BreakIndicator = styled.div`
  background-color: #0060e6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  width: auto;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  height: 24px;
`;

export const BreakRow = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 100px) repeat(6, minmax(120px, 1fr));
  min-width: fit-content;
  background-color: rgb(227, 242, 253);
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: minmax(60px, 80px) repeat(6, minmax(90px, 1fr));
  }
`;

export const TimeCell = styled.div<{ $isCurrent?: boolean }>`
  box-sizing: border-box;
  position: relative;
  padding: 12px 16px;
  font-size: clamp(12px, 1.2vw, 13px);
  color: #4a5568;
  background: #fff;
  border-right: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  height: 100%;
  min-width: 80px;

  .start-time {
    display: block;
    font-weight: 600;
    color: ${props => props.$isCurrent ? '#2196f3' : '#2d3748'};
    margin-bottom: 2px;
    font-size: clamp(14px, 1.4vw, 16px);
  }

  .end-time {
    display: block;
    font-size: clamp(11px, 1.1vw, 12px);
    color: ${props => props.$isCurrent ? '#2196f3' : '#718096'};
  }
  
  @media (max-width: 768px) {
    padding: 8px 6px;
    min-width: 60px;
    
    .start-time {
      font-size: clamp(12px, 3vw, 14px);
      margin-bottom: 1px;
    }
    
    .end-time {
      font-size: clamp(10px, 2.5vw, 11px);
    }
  }
`;

export const CoursesContainer = styled.div<{ $isCurrent?: boolean; $isFirstDay?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  background: ${props => props.$isCurrent ? '#e3f2fd' : '#fff'};
  min-height: 100px;
  position: relative;
  transition: all 0.2s ease-in-out;
  border-right: 1px solid #e0e0e0;
  min-width: 120px;
  height: 100%;

  ${props => props.$isFirstDay && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0px;
      bottom: 0;
      width: 1px;
      background-color: #e0e0e0;
      z-index: 1;
    }
  `}

  &:last-child {
    border-right: none;
  }

  &:hover {
    padding-bottom: 40px;
  }

  &:hover .add-button {
    opacity: 1;
    visibility: visible;
  }

  &.can-drop {
    background: #e3f2fd;
  }
  
  @media (max-width: 768px) {
    min-width: 90px;
    min-height: 80px;
    padding: 3px;
    gap: 3px;
    
    &.tapped {
      padding-bottom: 20px;
      background: ${props => props.$isCurrent ? '#d4e9fc' : '#f5f9ff'};
      
      .add-button {
        opacity: 1;
        visibility: visible;
        animation: fadeIn 0.2s ease-in-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(5px) translateX(-50%);
        }
        to {
          opacity: 1;
          transform: translateY(0) translateX(-50%);
        }
      }
    }
  }
`;

export const AddButton = styled.button`
  padding: 4px 8px;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  color: #666;
  width: calc(100% - 10px);
  position: absolute;
  bottom: 5px;
  left: 5px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
  z-index: 0;

  &:hover {
    background: #d0d0d0;
  }
  
  @media (max-width: 768px) {
    font-size: 0.55em;
    padding: 2px 4px;
    width: auto;
    min-width: 40%;
    max-width: 70%;
    left: 50%;
    transform: translateX(-50%);
    bottom: 3px;
    font-weight: 500;
    background: #a0a0a0;
    color: white;
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    white-space: nowrap;
    letter-spacing: -0.2px;
    
    &:active {
      background: #888888;
      transform: translateX(-50%) translateY(1px);
    }
  }
`;

