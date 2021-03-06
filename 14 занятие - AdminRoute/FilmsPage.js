import React, {Component} from "react"
import {Route, Redirect} from 'react-router-dom'
import api from "../api"
import FilmsList from "./films"
import {AppContext} from './App'
import FilmForm from "./forms/FilmForm"
import {orderBy, find} from 'lodash';
import AdminRoute from "./AdminRoute";


class FilmsPage extends Component {
    state = {
        films: [],
        isLoading: true,
    }

    componentDidMount() {
        api.films
            .fetchAll()
            .then(films =>
                this.setState({films: this.sortFilms(films), isLoading: false}),
            )
    }


    sortFilms = films => orderBy(films, ["featured", "title"], ["desc", "asc"])

    toggleFeatured = id => {
        const film = find(this.state.films, {_id: id})

        return this.updateFilm({...film, featured: !film.featured})
    }

    saveFilm = film => (film._id ? this.updateFilm(film) : this.addFilm(film))

    addFilm = filmData =>
        api.films.create(filmData).then(film =>
            this.setState(({films}) => ({
                films: this.sortFilms([...films, {...film}]),
                showAddForm: false,
            })),
        )

    updateFilm = filmData =>
        api.films.update(filmData).then(film =>
            this.setState(({films}) => ({
                films: this.sortFilms(
                    films.map(item => (item._id === film._id ? film : item)),
                ),
                showAddForm: false,
            })),
        )

    deleteFilm = film =>
        api.films.delete(film).then(() =>
            this.setState(({films}) => ({
                films: this.sortFilms(films.filter(item => item._id !== film._id)),
            })),
        )

    render() {
        const numCol = this.props.location.pathname === "/films" ? "sixteen" : "ten"

        return (
            <AppContext.Provider
                value={{
                    toggleFeatured: this.toggleFeatured,
                    deleteFilm: this.deleteFilm,
                    user: this.props.user,
                }}
            >
                <div className="ui stackable grid">



                    <div className={`${numCol} wide column`}>
                        <AdminRoute role={this.props.user.role} path="/films/new" submit={this.saveFilm} film={{}} />
                        <AdminRoute
                            role={this.props.user.role}
                            path="/films/edit/:_id"
                            submit={this.updateFilm}
                            films={this.state.films}
                        />
                        {
                            this.state.loading ? (
                                <div className="ui icon message">
                                    <i className="notched circle loading icon" />
                                    <div className="content">
                                        <div className="header">films loading</div>
                                    </div>
                                </div>
                            ) : (
                                <FilmsList films={this.state.films} editFilm={this.selectFilmForEdit} deleteFilm={this.deleteFilm} />
                            )
                        }
                    </div>
                </div>
            </AppContext.Provider>
        )
    }
}

export default FilmsPage
