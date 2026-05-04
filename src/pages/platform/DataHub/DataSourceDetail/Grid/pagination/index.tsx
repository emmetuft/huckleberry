import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd';
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import styles from './index.module.css';
import { selectNumRows, selectPage, setPage } from 'reducers/datasource/slice';

interface Props {
  pageSize: number;
}

const Pagination: FC<Props> = ({ pageSize }) => {
  const dispatch = useDispatch();
  const page = useSelector(selectPage);
  const numRows = useSelector(selectNumRows);
  const totalPages = Math.ceil(numRows / pageSize);

  const onClickFirstPage = () => {
    dispatch(setPage(1));
  };
  const onClickLastPage = () => {
    dispatch(setPage(totalPages));
  };
  const onClickNextPage = () => {
    dispatch(setPage(page + 1));
  };
  const onClickPreviousPage = () => {
    dispatch(setPage(page - 1));
  };

  return (
    <div className={styles.pagination}>
      <div className={styles.pageBtns}>
        <Button shape="circle" onClick={onClickFirstPage} disabled={page === 1}>
          <CaretDoubleLeftIcon />
        </Button>
        <Button
          shape="circle"
          onClick={onClickPreviousPage}
          disabled={page === 1}
        >
          <CaretLeftIcon />
        </Button>
        {page} of {totalPages}
        <Button
          shape="circle"
          onClick={onClickNextPage}
          disabled={page === totalPages}
        >
          <CaretRightIcon />
        </Button>
        <Button
          shape="circle"
          onClick={onClickLastPage}
          disabled={page === totalPages}
        >
          <CaretDoubleRightIcon />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
