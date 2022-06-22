require "graphql-client"
require "graphql/client/http"

module Server
    HTTP = GraphQL::Client::HTTP.new("http://127.0.0.1:4000/graphql")
    Schema = GraphQL::Client.load_schema(HTTP)
    Client = GraphQL::Client.new(schema: Schema, execute: HTTP)
end

Temp = Server::Client.parse <<-'GRAPHQL'
  query {
    test {
      name
    }
  }
GRAPHQL

result = Server::Client.query(Temp::Query)