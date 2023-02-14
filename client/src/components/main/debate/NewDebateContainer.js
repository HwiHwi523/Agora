import Debate from "./Debate"

import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import customAxios from "utils/customAxios";
import { useDebateList } from "utils/hooks/useDebateList";
import Spinner from "components/common/Spinner";

function NewDebateContainer( {maximumVisibleCounts, minimumVisibleCounts, type, url, slidePerClick} ) {
  const [currSlideIdx, setCurrSlideIdx] = useState(0);
  const [visibleCounts, setVisibleCounts] = useState(maximumVisibleCounts);
  
  const SLIDE_PER_CLICK = useRef(null);
  const isBigScreen = useMediaQuery({ query: '(min-width: 1025px)'})

  useEffect(() => {
    isBigScreen ? setVisibleCounts(maximumVisibleCounts) : setVisibleCounts(minimumVisibleCounts);
  }, [isBigScreen])

  useEffect(() => {
    if (slidePerClick === 1) {
      SLIDE_PER_CLICK.current = 1;
    } else {
      SLIDE_PER_CLICK.current = visibleCounts;
    }
  }, [visibleCounts])

  // data fetching logic
  const params = type === "hot-thumbnail"
    ? null
    : {roomState: `${type === "mid" ? true : false}`, category: "전체", order: "createnew", page: 0, size: 10,}

  const { isLoading, data, isError, error } = useDebateList(url, params);

  if (isLoading) return <Spinner />;
  const debateList = isError ? error.alterData : data;
  // end of fetchig logic

  const prevSlide = () => {
    const max = (a, b) => {return a < b ? b : a};
    if (currSlideIdx > 0) {
      setCurrSlideIdx(max(currSlideIdx - SLIDE_PER_CLICK.current, 0));
    }
  }

  const nextSlide = () => {
    const min = (a, b) => {return a < b ? a : b};
    if (currSlideIdx + visibleCounts < debateList.length) {
      setCurrSlideIdx(min(currSlideIdx + SLIDE_PER_CLICK.current, debateList.length - visibleCounts));
    }
  } 

  return (
    <Container>
      <LeftButton direction="left" onClick={prevSlide} currSlideIdx={currSlideIdx}><Text>&#8249;</Text></LeftButton>
        <DebateWrapper currSlideIdx={currSlideIdx} visibleCounts={visibleCounts} >
          {debateList.map((debate, idx) => {
            return <Debate 
            key={type + debate.roomId} 
            currSlideIdx={currSlideIdx} 
            itemIdx={idx} 
            visibleCounts={visibleCounts}
            type={type} 
            roomInfo={debate} 
            />
          })}
        </DebateWrapper>
      <RightButton direction="right" onClick={nextSlide} currSlideIdx={currSlideIdx} visibleCounts={visibleCounts} numOfSlides={debateList.length}><Text>&#8250;</Text></RightButton>
    </Container>
  )
} 

export default NewDebateContainer;

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  &:hover {
    z-index: 1;
  }
  /* margin-bottom: 200px; */
`

const DebateWrapper = styled.div`
  width: 92%;
  --current-index: ${props => props.currSlideIdx};
  --visible-counts: ${props => props.visibleCounts};

  transform: translateX(calc(-100% * var(--current-index) / var(--visible-counts)));
  transition: transform ${props => props.visibleCounts > 3 ? 300 : 150}ms ease-in-out;

  display: flex;
  flex-grow: 1;
  margin: 0 .25rem;
`

const Text = styled.div`
  transition: transform 150ms ease-in-out;
`

const Button = styled.button`
  position: relative;
  flex-grow: 0;
  width: 4%;
  margin: .25rem 0;
  border-radius: 1rem;
  opacity: 0.5;
  transition: background-color 150ms ease-in-out;
  &:hover {
    background-color: rgba(0, 0, 0, .5);
    ${Text} {
      transform: scale(2);
    }
  }
  cursor: pointer;
  z-index: 10; 

  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 3rem;
  line-height: 0;
`

const LeftButton = styled(Button)`
  border-top-left-radius: 0; border-bottom-left-radius: 0;
  transition: visibility 150ms ease-in-out;
  visibility: ${props => props.currSlideIdx === 0 ? "hidden" : "visible"};
`

const RightButton = styled(Button)`
  border-top-right-radius: 0; border-bottom-right-radius: 0;
  transition: visibility 150ms ease-in-out;
  visibility: ${props => props.currSlideIdx + props.visibleCounts >= props.numOfSlides ? "hidden" : "visible"};
`

