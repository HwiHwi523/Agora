import styled from "styled-components";

const StyledJoinAsSpeaker = styled.div`
  // 크기 설정
  width: calc( 100% - 10% );
  margin: 16px 0 0 0;
  padding: 0 5%;

  // Display
  display: flex;
  justify-content: space-between;
`;
const OpinionButton = styled.button`
  // 크기 설정
  width: 40%;
  margin: 0 5%;
  aspect-ratio: 7 / 5;

  // 디자인
  color: #FFFFFF;
  border-radius: 20px;

  &.selectLeftOpinion {
    border-color: #F6C026;
    ${({ disabled }) => disabled
      ? "background-color: #D4D4D4; border-color: #D4d4d4;"
      : "background-color: #F6C026; border-color: #377BC3; cursor: pointer;"}
  }
  &.selectRightOpinion {
    ${({ disabled }) => disabled
      ? "background-color: #D4D4D4; border-color: #D4D4D4;"
      : "background-color: #377BC3; border-color: #377BC3; cursor: pointer;"}
  }
`;
const OpinionText = styled.p`
  // 마진 및 패딩 초기화
  margin: 0;
  padding: 0;

  // 글꼴 설정
  color: #FFFFFF;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.05rem;

  // 글자수 초과 처리
  overflow: hidden;
  text-overflow: ellipsis;
`;

function JoinAsSpeaker(props) {
  const leftOpinion = props?.roomInfo?.leftOpinion;
  const rightOpinion = props?.roomInfo?.rightOpinion;
  const leftUserList = props?.roomInfo?.leftUserList;
  const rightUserList = props?.roomInfo?.rightUserList;

  const join = (opinion) => {
    let isValid = true;

    const choice = window.confirm(`'${opinion}' 측 발언자로 참여 하시겠습니까?`);
    if (choice === true) {
      // 카메라, 오디오 확인
      const srcObject = document.querySelector("video").srcObject;
      let onCameraTrack = false;
      let onAudioTrack = false;
      if (srcObject) {
        const tracks = srcObject.getTracks();
        tracks.forEach(track => {
          if (track.kind === "video") {
            onCameraTrack = true;
          } else if (track.kind === "audio") {
            onAudioTrack = true;
          }
        });
      }
      if (!onCameraTrack || !onAudioTrack) {
        document.querySelector("#deviceSetting").classList.add("wrong");
        isValid = false;
      }

      // 카메라와 오디오 모두 켜져 있다면,
      if (isValid) {
        
      }
    }
  };

  return (
    <StyledJoinAsSpeaker>
      {/* 왼쪽 의견 */}
      <OpinionButton
        className="selectLeftOpinion"
        disabled={leftUserList.length === 3}
        onClick={() => { join(leftOpinion); }}
      >
        <OpinionText title={leftOpinion}>{leftOpinion}</OpinionText>
        <OpinionText>({leftUserList.length} / 3)</OpinionText>
      </OpinionButton>
      
      {/* 오른쪽 의견 */}
      <OpinionButton
        className="selectRightOpinion"
        disabled={rightUserList.length === 3}
        onClick={() => { join(rightOpinion); }}
      >
        <OpinionText title={rightOpinion}>{rightOpinion}</OpinionText>
        <OpinionText>({rightUserList.length} / 3)</OpinionText>
      </OpinionButton>
    </StyledJoinAsSpeaker>
  );
}

export default JoinAsSpeaker;