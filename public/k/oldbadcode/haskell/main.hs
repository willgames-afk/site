import Data.Char

expected x = error $ x ++ " expected"

data Expression =
  Num Integer
  | Var String
  | Add Expression Expression
  | Sub Expression Expression
  | Mul Expression Expression
  | Div Expression Expression
  deriving (Show)

type Parser a = String -> Maybe (a, String) -- Takes a string and returns a parsed value and the remaining part of the string, or nothing if the parse failed

-- Parse an A, the run a function on the result. If the function returns true, return the result
infix 7 <=>

(<=>) :: Parser a -> (a -> Bool) -> Parser a
(parser <=> predicate) input =
  case parser input of
    Nothing -> Nothing
    Just (a, rest) -> if (predicate a) then Just (a, rest) else Nothing

--Parse an A, then a B, and return the results as a Pair. If either parse fails, return nothing
infixl 6 <+>

(<+>) :: Parser a -> Parser b -> Parser (a, b)
(parserA <+> parserB) input =
  case parserA input of
    Nothing -> Nothing
    Just (resultA, remaindier) -> case parserB remaindier of
      Nothing -> Nothing
      Just (resultB, cs) -> Just ((resultA, resultB), cs)

--Parse an A, then a B, but discard the B, returning A. If either parse fails, return nothing.
infixl 6 <+->

(<+->) :: Parser a -> Parser b -> Parser a
(parserA <+-> parserB) input =
  case parserA input of
    Nothing -> Nothing
    Just (resultA, remaindier) -> case parserB remaindier of
      Nothing -> Nothing
      Just (_, cs) -> Just (resultA, cs)

--Parse an A, then a B, but discard the A, returning B. if either parse fails, return nothing
infixl 6 <-+>

(<-+>) :: Parser a -> Parser b -> Parser b
(parserA <-+> parserB) input =
  case parserA input of
    Nothing -> Nothing
    Just (_, remaindier) -> case parserB remaindier of
      Nothing -> Nothing
      Just (resultB, cs) -> Just (resultB, cs)


infixl 5 >>>
(>>>) :: Parser a -> (a -> b) -> Parser b
(parser >>> transformer) input = 
    case parser input of
        Nothing -> Nothing 
        Just (resultA, remainder) -> Just ((transformer resultA), remainder)

--Extract a parser's result and feed it into the next expression
infix 4 +>
(+>) :: Parser a -> (a -> Parser b) -> Parser b
(parser +> function) input = 
    case parser input of 
        Nothing -> Nothing 
        Just(a,cs) -> function a cs

--Try to parse A and return the output. If if fails, return B
infixl 3 <|>

(<|>) :: Parser a -> Parser a -> Parser a
(parserA <|> parserB) input =
  case parserA input of
    Nothing -> parserB input
    result -> result

iter :: Parser Char -> Parser String
iter m = (iterS m) <=> (/="")
iterS m = m <+> iter m >>> (\(x,y) -> x:y)
    <|> result []

char :: Parser Char
char [] = Nothing
char (x : xs) = Just (x, xs)

digit :: Parser Char
digit = char <=> isDigit

digits :: Parser String
digits = iter digit

number :: Parser Integer
number = literal '-' <-+> digits >>> (\n -> -1 * (read n :: Integer) )
     <|> digits >>> (\n -> read n :: Integer)

space :: Parser Char
space = char <=> isSpace

letter :: Parser Char
letter = char <=> isAlpha

letters :: Parser String
letters = iter letter

literal :: Char -> Parser Char
literal c = char <=> (== c)

data Assign = Assign String Expression
  deriving (Show)

assign :: Parser (String, Expression)
assign = token(letters) <+-> token(literal '=' ) <+> expression

factor :: Parser Expression
factor = token(literal '(' ) <-+> token(expression) <+-> token(literal ')')
    <|> number >>> Num
    <|> letters >>> Var

term :: Parser Expression
term = factor +> term'
term' e = mulOp <+> factor >>> buildOp e +> term'
        <|> result e

expression :: Parser Expression
expression = token(term) +> expression'
expression' e = addOp <+> term >>> buildOp e +> expression'
        <|> result e

buildOp :: Expression -> ((Expression -> Expression -> Expression), Expression) -> Expression
buildOp expressionA (op, expressionB) = op expressionA expressionB

addOp :: Parser (Expression -> Expression -> Expression)
addOp = token(literal '+') >>> (\_ -> Add)
    <|> token(literal '-') >>> (\_ -> Sub)

mulOp :: Parser (Expression -> Expression -> Expression)
mulOp = token(literal '*') >>> (\_ -> Mul)
    <|> token(literal '/') >>> (\_ -> Div)

parse :: String -> Assign
parse s = Assign id expr
    where (id, expr) = case (assign s) of
            Nothing -> error "Invalid Assignment"
            Just ((a, b), _) -> (a, b)

result :: a -> Parser a
result a cs = Just(a,cs)

token :: Parser a -> Parser a
token = (<+-> iterS space)