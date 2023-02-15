import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Container from "@mui/system/Container";

// child components
import HeadTitle from "components/debateroom/HeadTitle";
import TimeBox from "components/debateroom/TimeBox";
import CardComponent from "components/debateroom/CardComponent";
import DebaterBox from "components/debateroom/DebaterBox";
import VideoComponent from "components/debateroom/VideoComponent";
import ReadyVideo from "components/debateroom/ReadyVideo";

// axios
import customAxios from "utils/customAxios";

// recoil
import { useRecoilState, useRecoilValue } from "recoil";
import { isStartState, leftCardListState, rightCardListState, leftUserListState, rightUserListState, readyUserListState, phaseNumberState, phaseDetailState, voteLeftResultState, voteRightResultState, timerState, counterState } from "stores/DebateStates";
import { userInfoState } from "stores/userInfoState";
import { debateUserRoleState } from "stores/joinDebateRoomStates";
import getToken from "components/debateroom/GetToken";
import axios from "axios";
 

function DebateRoom() {
  // state
  const { roomId } = useParams();
  const userInfo = useRecoilValue(userInfoState);
  const nickname = userInfo?.userNickname;
  const [currentSpeakingTeam, setCurrentSpeakingTeam] = useState("");
  const [currentSpeakingUser, setCurrentSpeakingUser] = useState("");
  const [isAllReady, setIsAllReady] = useState(false)
  const [leftCardList, setLeftCardList] = useRecoilState(leftCardListState);
  const [rightCardList, setRightCardList] = useRecoilState(rightCardListState);
  const [leftUserList, setLeftUserList] = useRecoilState(leftUserListState);
  const [rightUserList, setRightUserList] = useRecoilState(rightUserListState);
  const [readyUserList, setReadyUserList] = useRecoilState(readyUserListState);
  const [master, setMaster] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomToken, setRoomToken] = useState(undefined);
  const [phaseNum, setPhaseNum] = useRecoilState(phaseNumberState);
  const [phaseDetail, setPhaseDetail] = useRecoilState(phaseDetailState);
  const [rightOpinion, setRightOpinion] = useState("");
  const [leftOpinion, setLeftOpinion] = useState("");
  const [timer, setTimer] = useRecoilState(timerState);
  const [counter, setCounter] = useRecoilState(counterState);
  const [isStart, setIsStart] = useRecoilState(isStartState);
  const [watchNum, setWatchNum] = useState(0);
  const [voteLeftResult, setVoteLeftResult] = useRecoilState(voteLeftResultState);
  const [voteRightResult, setVoteRightResult] = useRecoilState(voteRightResultState);
  const [role, setRole] = useRecoilState(debateUserRoleState);
  
  // listening
  const [listening, setListening] = useState(false);
  const [meventSource, msetEventSource] = useState(undefined);

  // navigate
  const navigate = useNavigate();
  

  useEffect(() => {
    console.log(roomToken)
    console.log(isStart)
  }, [roomToken, isStart])

  useEffect(() => {
    // 초기 데이터 받기
    async function get() {
      const axios = customAxios();
      axios
        .get(`/v2/room/enter/${roomId}`)
        .then(response => {
          const data = response.data.body
          setCurrentSpeakingTeam(data.currentSpeakingTeam);
          setCurrentSpeakingUser(data.currentSpeakingUser);
          setIsAllReady(data.isAllReady);
          setLeftCardList(data.leftOpenedCardList);
          setLeftUserList(data.leftUserList);
          setRoomToken(data.openviduToken);
          setReadyUserList(data.readyUserList);
          setRightCardList(data.rightOpenedCardList);
          setRightUserList(data.rightUserList);
          setMaster(data.roomCreaterName);
          setRoomName(data.roomName);
          setRightOpinion(data.roomOpinionRight);
          setLeftOpinion(data.roomOpinionLeft);
          setPhaseNum(data.roomPhase);
          setPhaseDetail(data.roomPhaseDetail);
          setTimer(data.roomPhaseRemainSecond);
          setCounter(data.roomTimeInProgressSecond);
          setWatchNum(data.roomWatchCnt);
          setVoteLeftResult(data.voteLeftResultsList);
          setVoteRightResult(data.voteRightResultsList);

          return data.roomState
        })
        .then(roomState => {
          const setRoomState = (state) => {
            setIsStart(state);
          };
          setTimeout(setRoomState, 2000, roomState);
        })
        .catch(error => {
          console.log(error);
        })
    }
    get();
    // SSE 연결 
    let eventSource = undefined;

    if(!listening) {
      const baseURL = process.env.REACT_APP_SERVER_BASE_URL
      console.log("listening", listening);

      eventSource = new EventSource(`${baseURL}/v2/room/subscribe/${roomId}`)
      msetEventSource(eventSource);
      console.log("eventSource", eventSource);

      eventSource.onopen = event => {
          console.log("main 연결완료");
      };

      eventSource.onmessage = event => {
        console.log("onmessage");

        const data = JSON.parse(event.data)
        // SSE 수신 데이터 처리
        console.log(data);
        // 1. ready 신호 처리
        if (data.event === "ready") {
          setReadyUserList(data.readyUserList);
          if (data.allReady) {
            // 시작 신호가 오면 card를 axios post
            setIsAllReady(true);
          }
        };

        // 2. phase 신호 처리
        // 2.1. debate phase 신호 처리
        if (data.event === "startDebate") {
          setIsStart(true);
          setPhaseNum(data.roomPhase);
          setPhaseDetail(data.roomPhaseDetail);
          setTimer(10);         
        };
        if (data.event === "startSpeakPhase") {
          setPhaseNum(data.roomPhase);
          setPhaseDetail(data.roomPhaseDetail);
          // timer 처리  
          setTimer(180);
        }
        // 2.2. vote phase 신호 처리
        if (data.event === "startVotePhase") {
          setPhaseNum(data.roomPhase);
          setPhaseDetail(data.roomPhaseDetail);
          // timer 처리
          setTimer(60);          
        }
        // 2.2. vote result phase 신호 처리
        if (data.event === "startVoteResultPhase") {
          setPhaseNum(data.roomPhase);
          setPhaseDetail(data.roomPhaseDetail);
          // timer 처리
          setTimer(10);
          // 투표 결과 처리
          setVoteLeftResult(data.voteLeftResultsList);
          setVoteRightResult(data.voteRightResultsList);
        }

        // 3. enter 신호 처리
        if (data.event === "enter") {
          setLeftUserList(data.leftUserList);
          setRightUserList(data.rightUserList);
        }

        // 4. cardOpen 신호 처리
        if (data.event === "cardOpen") {
          setLeftCardList(data.leftOpenedCardList);
          setRightCardList(data.rightOpenedCardList);
        }
        
        // 5. 실시간 시청자수 처리
        if (data.event === "updateWatchCnt") {
          setWatchNum(data.roomWatchCnt);
        }

        // 6. 방 나가기 신호
        if (data.event === "endDebate") {
          window.alert("토론이 종료되었습니다;.")
          navigate("/debate/list")
        }
      };

      eventSource.onerror = event => {
        console.log(event.target.readyState);
        if (event.target.readyState === EventSource.CLOSED) {
          console.log("eventsource closed (" + event.target.readyState + ")");
        }
        eventSource.close();
      };
      setListening(true);  

      window.addEventListener('beforeunload', handleBeforeUnload)
    }
    return () => {
      eventSource.close();
      console.log("eventsource closed")
      // 나갈 때, post
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  const [postFlag, setPostFlag] = useState(false);
  const handleBeforeUnload = () => {
    setPostFlag(true);
  };

  useEffect(() => {
    if (postFlag) {
      const axios = customAxios();
        axios
          .post('v2/room/leave', {
            "roomId": roomId,
            "userNickname" : nickname,
          })
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.log(error)
          })
      setPostFlag(false);
    }
  }, [postFlag]);

  // VideoComponent props data
  const data = {
    roomToken : roomToken,
    nickname : nickname,
    role: role,
    phaseNum: phaseNum,
    phaseDetail: phaseDetail,
    leftOpinion: leftOpinion,
    rightOpinion: rightOpinion,
    leftUser: leftUserList,
    rightUser: rightUserList,
    roomId: roomId,
  };

  return (
    <Container maxWidth="xl">
      <HeadTitle isStart={isStart} title={roomName} watchNum={watchNum} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={7} lg={8}>
          {!isStart
            ? (
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <ReadyVideo opinion={"A쪽 주장입니다"} />
                </Grid>
                <Grid item xs={6}>
                  <ReadyVideo opinion={"B쪽 주장입니다"} />
                </Grid>
              </Grid>
            ) : (
                <VideoComponent data={data} />
            )}
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <DebaterBox data={leftUserList} sessionNum={phaseNum} />
            </Grid>
            <Grid item xs={6}>
              <DebaterBox data={rightUserList} sessionNum={phaseNum} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TimeBox isAllReady={isAllReady} roomId={roomId} role={role} nickname={nickname} />
            </Grid>
            <Grid item xs={12}>
              <CardComponent role={role} roomId={roomId} nickname={nickname} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DebateRoom;
