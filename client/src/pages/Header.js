// 화면의 상단 부분에 들어갈 헤더입니다.
// components 폴더의 컴포넌트들을 조합하여 사용자에게 보여지는 페이지를 구성합니다.

// 헤더 컴포넌트를 불러 와 페이지에 배치합니다.
import styled from "styled-components";

// 라우터 이동을 위한 Link
import LeftComponents from "components/header/left/LeftComponents";
import CenterComponents from "components/header/center/CenterComponents";
import RightComponents from "components/header/right/RightComponents";

// 토론방 정보 및 사용자 정보 상태 관리
import { useRecoilValue } from "recoil";
import { debateInfoState, userInfoState } from "stores/atoms";
import { useCallback, useLayoutEffect, useState } from "react";

import { debounce } from "lodash";

// 상단바
const StyledHeader = styled.header`
  // 높이 고정
  height: 64px;

  // 헤더 색상 설정, 배경색 그림자색
  background-color: #FFFFFF;  // 배경색 : 흰색
  box-shadow: 1px 1px 1px #DCDCDC;  // 박스 그림자 설정
  
  // 상단 고정
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
`;

const HeaderContents = styled.div`
  // 높이 고정
  height: 100%;

  // 컴포넌트 배치
  display: flex;
  justify-content: space-between;
  align-items: center;

  // 고해상도에서 최대 너비 1920px로 가운데 정렬
  margin: 0 auto;
  max-width: 1920px;
`;

function Header() {
  // Test : 활성화 시 모든 헤더 버튼들 보기
  const userInfo = useRecoilValue(userInfoState);
  const debateInfo = useRecoilValue(debateInfoState);

  // console.log(userInfo);
  // console.log(debateInfo);

  const [isHeaderShow, setIsHeaderShow] = useState(true);
  const [prevY, setPrevY] = useState(0);

  // 스크롤이 멈췄는지 확인해주는 핸들러
  const stopScroll = useCallback((e) => {
    // 스크롤이 가장 끝까지 올라가면 헤더보임.
    // 스크롤이 멈추면 헤더안보임
    if (window.scrollY === 0) {
      setIsHeaderShow(true)
    } else {
      const diff = window.scrollY - prevY;
      if (diff > 0) {
        setIsHeaderShow(false);
      } else if (diff < 0) {
        setIsHeaderShow(true);
      }
      setPrevY(window.scrollY);
    }
  }, [prevY]);
  
  // 스크롤의 멈춤은 디바운스를 이용한다. (디바운스가 마지막 그룹의 이벤트를 노티해주는 특성 이용)
  const debounceScroll = useCallback(debounce(stopScroll, 300), [prevY]);
  const scrollDetectHandler = useCallback(
    (...e) => {
      debounceScroll(...e);
    },
    [prevY]
  );

  useLayoutEffect(() => {
    window.addEventListener("scroll", scrollDetectHandler);
  }, [prevY]);

  if (!isHeaderShow) {
    return null;
  }
  return (
    <StyledHeader>
      <HeaderContents>
        {/* 로고 */}
        < LeftComponents />

        {/* 검색창 */}
        < CenterComponents />

        {/* 그룹 */}
        < RightComponents />
      </HeaderContents>
    </StyledHeader>
  );
}

export default Header;