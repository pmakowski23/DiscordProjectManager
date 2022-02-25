import axios from 'axios';

export default function (url: string) {
  setInterval(() => {
    axios
      .get(url)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        const { response } = error;
        const { status, statusText } = response;
        console.log(status, statusText);
      });
  }, 1500000);
}
