type Movie = {
    id: string,
    rating: number,
    director: string,
    tags: string[],
    title: string,
    about: string,
    description: string,
    image: string,
    cover: string
};

type Schedule = {
    daytime: string,
    hall: string,
    rows: number,
    seats: number,
    price: number
};

type Ticket = {
    film: string,
    daytime: string,
    row: number,
    seat: number,
    price: number
};

type OrderedTicket = Ticket & {
    id: string
};