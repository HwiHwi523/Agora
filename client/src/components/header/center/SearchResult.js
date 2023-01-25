import { useRecoilValue } from "recoil";
import { creatorSearchResultState, hashTagsSearchResultState, titleSearchResultState } from "stores/atoms";
import styled from "styled-components";

const StyledSearchResultWrapper = styled.div`
  background-color: #DFDFDF;

  width: 26rem;
  max-height: 650px;
  overflow: auto;

  border-radius: 0px 0px 10px 10px;

  padding: 0 2rem 1rem 2rem;

  position: absolute;
  top: 40px;
  left: 0;
`;

function SearchResultSetWrapper() {
  const hashTagsContents = useRecoilValue(hashTagsSearchResultState);
  const creatorContents = useRecoilValue(creatorSearchResultState);
  const titleContents = useRecoilValue(titleSearchResultState);

  // 해시태그로만 검색했을 때 결과
  let contents = <SearchResultSet searchType={"hashtags"} maxContents={4} contents={hashTagsContents} />;
  
  // 그 외 검색결과 (사용자 이름 검색결과 및 방제 검색결과)
  if (creatorContents.length > 0 || titleContents.length > 0) {
    contents = (
      <>
      <SearchResultSet searchType={"creator"} maxContents={1} contents={creatorContents} />
      <SearchResultSet searchType={"title"} maxContents={2} contents={titleContents} />
      </>
    );
  }

  return (
    <StyledSearchResultWrapper>
      <SearchResultSet searchType={"해시 태그 검색 결과"} data={[1, 2, 3, 4]} />
      <SearchResultSet searchType={"사용자 이름 검색 결과"} data={[6, 1, 5, 2]} />
    </StyledSearchResultWrapper>
  );
}

export default SearchResult;